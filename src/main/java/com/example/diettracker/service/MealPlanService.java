package com.example.diettracker.service;

import com.example.diettracker.model.Food;
import com.example.diettracker.repository.FoodRepository;
import com.google.ortools.linearsolver.MPConstraint;
import com.google.ortools.linearsolver.MPObjective;
import com.google.ortools.linearsolver.MPSolver;
import com.google.ortools.linearsolver.MPSolver.ResultStatus;
import com.google.ortools.linearsolver.MPVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * 确保在项目中已加载 OR-Tools 的 native 动态库,
 * 例如在 main 函数或配置类中调用: Loader.loadNativeLibraries();
 */

/*  Min: |protein_ratio - 0.3| + |carbs_ratio - 0.2| + |fat_ratio - 0.5| + 
     0.1 * Σ(meat_repeat_penalty) + 
     0.1 * Σ(veg_repeat_penalty) + 
     0.1 * Σ(carb_repeat_penalty) */
@Service
public class MealPlanService {

    @Autowired
    private FoodRepository foodRepository;

    private static final int[] MEALS = { 0, 1, 2 }; // 三餐编码: 0=早餐,1=午餐,2=晚餐
    // private static final double[] MEAL_RATIOS = { 0.3, 0.4, 0.3 }; //
    // 对应三餐在总卡路里中的比例
    private static final double ALPHA = 0.1; // 重复使用的惩罚系数(示例)
    private static final double TARGET_PROTEIN_RATIO = 0.3; // 蛋白质占比 30%
    private static final double TARGET_CARBS_RATIO = 0.2; // 碳水占比 20%
    private static final double TARGET_FAT_RATIO = 0.5; // 脂肪占比 50%

    /**
     * 主入口：根据用户给定的卡路里需求，返回三餐食物列表 (每餐 [meat, veg, carb])。
     * 若无解，返回 null。
     */
    public List<List<String>> mealPlanRecommendation(double calorieTarget) {
        // 1. 从数据库中读取全部食物
        List<Food> allFoods = foodRepository.findAll();

        // 添加调试信息
        System.out.println("Current food database size: " + allFoods.size());

        // 根据 categoryPred 分组
        List<Food> meats = allFoods.stream()
                .filter(f -> "meats".equalsIgnoreCase(f.getCategory()))
                .collect(Collectors.toList());
        List<Food> vegs = allFoods.stream()
                .filter(f -> "vegetables".equalsIgnoreCase(f.getCategory()))
                .collect(Collectors.toList());
        List<Food> carbs = allFoods.stream()
                .filter(f -> "carbs".equalsIgnoreCase(f.getCategory()))
                .collect(Collectors.toList());

        List<Food> others = allFoods.stream()
                .filter(f -> "others".equalsIgnoreCase(f.getCategory()))
                .collect(Collectors.toList());

        // =========== 第一阶段: 只考虑热量约束 ===========
        System.out.println("Stage 1: Simplified optimization, calorieTarget=" + calorieTarget);
        ModelData simplifiedModel = buildSimplifiedProblem(
                meats, vegs, carbs, others,
                calorieTarget,
                noRepeat(true));

        List<List<List<String>>> firstStageSolutions = enumerateSolutions(
                simplifiedModel,
                meats, vegs, carbs, others,
                maxSolutions(3));

        System.out.println("Stage 1 results: Found " + firstStageSolutions.size() + " solutions");

        if (firstStageSolutions.isEmpty()) {
            // 尝试放宽约束 - 允许重复食物
            System.out.println("Attempting to relax Stage 1 constraints - allowing repeated foods");
            simplifiedModel = buildSimplifiedProblem(
                    meats, vegs, carbs, others,
                    calorieTarget,
                    noRepeat(false));
            firstStageSolutions = enumerateSolutions(
                    simplifiedModel,
                    meats, vegs, carbs, others,
                    maxSolutions(3));
            System.out.println("Relaxed constraints Stage 1 results: "
                    + (firstStageSolutions.isEmpty() ? "No solution"
                            : "Found " + firstStageSolutions.size() + " solutions"));
        }

        if (!firstStageSolutions.isEmpty()) {
            // =========== 第二阶段: 基于第一阶段结果优化营养素比例 ===========
            System.out.println("Starting Stage 2 optimization: Nutrient ratios");
            List<List<List<String>>> finalSolutions = new ArrayList<>();

            for (List<List<String>> baselineSolution : firstStageSolutions) {
                // 基于第一阶段解构建完整模型，固定部分食物选择
                ModelData refinedModel = buildDailyMealProblem(
                        meats, vegs, carbs, others,
                        calorieTarget,
                        noRepeat(true),
                        addRepeatPenalty(true),
                        baselineSolution);

                // 求解第二阶段，只需要找一个最优解即可
                List<List<List<String>>> improvedSolutions = enumerateSolutions(
                        refinedModel,
                        meats, vegs, carbs, others,
                        maxSolutions(1));

                if (!improvedSolutions.isEmpty()) {
                    finalSolutions.add(improvedSolutions.get(0));
                    if (finalSolutions.size() >= 3) {
                        break; // 找到足够多的最终解则停止
                    }
                }
            }

            System.out.println("Stage 2 results: Generated " + finalSolutions.size()
                    + " candidate plans, will randomly select 1 as recommendation");

            if (!finalSolutions.isEmpty()) {
                // 随机返回一个解
                Random rand = new Random();
                return finalSolutions.get(rand.nextInt(finalSolutions.size()));
            }
        }

        // 如果两阶段优化失败，回退到原始方法
        System.out.println("Two-stage optimization failed, falling back to single-stage method");
        // (1) 先尝试硬约束 "不重复"
        ModelData modelData1 = buildDailyMealProblem(
                meats, vegs, carbs, others,
                calorieTarget,
                noRepeat(true),
                addRepeatPenalty(false),
                null);
        // 枚举可行解(最多找3个)
        List<List<List<String>>> solutions1 = enumerateSolutions(
                modelData1,
                meats, vegs, carbs, others,
                maxSolutions(3));
        System.out.println("Mode 1 (hard constraint, no repeat) results: "
                + (solutions1.isEmpty() ? "No solution" : "Found " + solutions1.size() + " solutions"));

        if (!solutions1.isEmpty()) {
            // 随机返回一个解
            Random rand = new Random();
            return solutions1.get(rand.nextInt(solutions1.size()));
        }

        // (2) 若无解，改为软约束，允许重复食材但给予重复惩罚
        ModelData modelData2 = buildDailyMealProblem(
                meats, vegs, carbs, others,
                calorieTarget,
                noRepeat(false),
                addRepeatPenalty(true),
                null);
        // 再找3个解
        List<List<List<String>>> solutions2 = enumerateSolutions(
                modelData2,
                meats, vegs, carbs, others,
                maxSolutions(3));
        System.out.println("Mode 2 (soft constraint, penalty for repeated) results: "
                + (solutions2.isEmpty() ? "No solution" : "Found " + solutions2.size() + " solutions"));

        if (!solutions2.isEmpty()) {
            Random rand = new Random();
            return solutions2.get(rand.nextInt(solutions2.size()));
        }

        // (3) 若仍无解，去掉所有重复约束和惩罚
        ModelData modelData3 = buildDailyMealProblem(
                meats, vegs, carbs, others,
                calorieTarget,
                noRepeat(false),
                addRepeatPenalty(false),
                null);
        // 再找3个解
        List<List<List<String>>> solutions3 = enumerateSolutions(
                modelData3,
                meats, vegs, carbs, others,
                maxSolutions(3));
        System.out.println("Mode 3 (no repeat constraint) results: "
                + (solutions3.isEmpty() ? "No solution" : "Found " + solutions3.size() + " solutions"));

        if (!solutions3.isEmpty()) {
            Random rand = new Random();
            return solutions3.get(rand.nextInt(solutions3.size()));
        }

        // 返回空解
        return Collections.emptyList();
    }

    /**
     * 构建第一阶段简化问题 - 只考虑热量约束，不考虑营养素比例
     */
    private ModelData buildSimplifiedProblem(
            List<Food> meats,
            List<Food> vegs,
            List<Food> carbs,
            List<Food> others,
            double calorieTarget,
            boolean noRepeat) {

        MPSolver solver = MPSolver.createSolver("SCIP");
        if (solver == null) {
            System.out.println("SCIP solver not available. Trying alternative solver...");
            solver = MPSolver.createSolver("CBC");
            if (solver == null) {
                System.out.println("CBC solver also not available, cannot continue.");
                return null;
            }
        }

        // 创建决策变量
        MPVariable[][] xMeats = new MPVariable[meats.size()][MEALS.length];
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                xMeats[i][m] = solver.makeBoolVar("meat_" + i + "_" + m);
            }
        }
        MPVariable[][] xVegs = new MPVariable[vegs.size()][MEALS.length];
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                xVegs[i][m] = solver.makeBoolVar("veg_" + i + "_" + m);
            }
        }
        MPVariable[][] xCarbs = new MPVariable[carbs.size()][MEALS.length];
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                xCarbs[i][m] = solver.makeBoolVar("carb_" + i + "_" + m);
            }
        }
        MPVariable[] xOthers = new MPVariable[others.size()];
        for (int i = 0; i < others.size(); i++) {
            xOthers[i] = solver.makeBoolVar("other_" + i);
        }

        // 每餐至少选择一种肉类、蔬菜和碳水
        for (int m : MEALS) {
            MPConstraint cMeat = solver.makeConstraint(1, Double.POSITIVE_INFINITY, "min_meat_" + m);
            for (int i = 0; i < meats.size(); i++) {
                cMeat.setCoefficient(xMeats[i][m], 1);
            }

            MPConstraint cVeg = solver.makeConstraint(1, Double.POSITIVE_INFINITY, "min_veg_" + m);
            for (int i = 0; i < vegs.size(); i++) {
                cVeg.setCoefficient(xVegs[i][m], 1);
            }

            MPConstraint cCarb = solver.makeConstraint(1, Double.POSITIVE_INFINITY, "min_carb_" + m);
            for (int i = 0; i < carbs.size(); i++) {
                cCarb.setCoefficient(xCarbs[i][m], 1);
            }
        }

        // 只在午餐中选择一个"others"类别食物
        MPConstraint cOther = solver.makeConstraint(1, 1, "one_other");
        for (int i = 0; i < others.size(); i++) {
            cOther.setCoefficient(xOthers[i], 1);
        }

        // 热量约束: 总热量在目标热量的95%-105%范围内
        MPConstraint cCalLower = solver.makeConstraint(0.95 * calorieTarget, Double.POSITIVE_INFINITY, "cal_lower");
        MPConstraint cCalUpper = solver.makeConstraint(0, 1.05 * calorieTarget, "cal_upper");

        // 添加热量约束系数
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                cCalLower.setCoefficient(xMeats[i][m], meats.get(i).getCaloricValue());
                cCalUpper.setCoefficient(xMeats[i][m], meats.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                cCalLower.setCoefficient(xVegs[i][m], vegs.get(i).getCaloricValue());
                cCalUpper.setCoefficient(xVegs[i][m], vegs.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                cCalLower.setCoefficient(xCarbs[i][m], carbs.get(i).getCaloricValue());
                cCalUpper.setCoefficient(xCarbs[i][m], carbs.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < others.size(); i++) {
            cCalLower.setCoefficient(xOthers[i], others.get(i).getCaloricValue());
            cCalUpper.setCoefficient(xOthers[i], others.get(i).getCaloricValue());
        }

        // 不重复约束（如果需要）
        if (noRepeat) {
            // 各类食材不重复使用
            for (int i = 0; i < meats.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "meat_" + i + "_once");
                for (int m : MEALS) {
                    c.setCoefficient(xMeats[i][m], 1);
                }
            }
            for (int i = 0; i < vegs.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "veg_" + i + "_once");
                for (int m : MEALS) {
                    c.setCoefficient(xVegs[i][m], 1);
                }
            }
            for (int i = 0; i < carbs.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "carb_" + i + "_once");
                for (int m : MEALS) {
                    c.setCoefficient(xCarbs[i][m], 1);
                }
            }
        }

        // 目标函数：最小化与目标热量的差距
        MPObjective objective = solver.objective();
        // 创建辅助变量表示与目标热量的差距
        MPVariable calDev = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "cal_deviation");
        MPConstraint cDevCalPos = solver.makeConstraint(0, Double.POSITIVE_INFINITY, "dev_cal_pos");
        MPConstraint cDevCalNeg = solver.makeConstraint(0, Double.POSITIVE_INFINITY, "dev_cal_neg");

        cDevCalPos.setCoefficient(calDev, 1);
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                cDevCalPos.setCoefficient(xMeats[i][m], -meats.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                cDevCalPos.setCoefficient(xVegs[i][m], -vegs.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                cDevCalPos.setCoefficient(xCarbs[i][m], -carbs.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < others.size(); i++) {
            cDevCalPos.setCoefficient(xOthers[i], -others.get(i).getCaloricValue());
        }
        // 将偏移量设置为约束的下界
        cDevCalPos.setBounds(calorieTarget, Double.POSITIVE_INFINITY);

        cDevCalNeg.setCoefficient(calDev, 1);
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                cDevCalNeg.setCoefficient(xMeats[i][m], meats.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                cDevCalNeg.setCoefficient(xVegs[i][m], vegs.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                cDevCalNeg.setCoefficient(xCarbs[i][m], carbs.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < others.size(); i++) {
            cDevCalNeg.setCoefficient(xOthers[i], others.get(i).getCaloricValue());
        }
        // 将偏移量设置为约束的下界
        cDevCalNeg.setBounds(-calorieTarget, Double.POSITIVE_INFINITY);

        // 优化目标：最小化热量偏差
        objective.setCoefficient(calDev, 1);
        objective.setMinimization();

        return new ModelData(solver, xMeats, xVegs, xCarbs, xOthers);
    }

    /**
     * 构建完整问题，优化营养素比例
     */
    private ModelData buildDailyMealProblem(
            List<Food> meats,
            List<Food> vegs,
            List<Food> carbs,
            List<Food> others,
            double calorieTarget,
            boolean noRepeat,
            boolean addRepeatPenalty,
            List<List<String>> baselineSolution) {
        // 计算可用的食物组合是否能满足卡路里目标
        System.out.println(
                "Building problem: calorieTarget=" + calorieTarget + ", noRepeat=" + noRepeat + ", addRepeatPenalty="
                        + addRepeatPenalty);

        // 1. 创建求解器
        // 注意: "CBC_MIXED_INTEGER_PROGRAMMING" 即使用 CBC 求解整型规划
        MPSolver solver = new MPSolver(
                "DailyMealPlan",
                MPSolver.OptimizationProblemType.CBC_MIXED_INTEGER_PROGRAMMING);

        // 2. 定义 0/1 决策变量 xMeats[i][m], xVegs[i][m], xCarbs[i][m]
        MPVariable[][] xMeats = new MPVariable[meats.size()][MEALS.length];
        MPVariable[][] xVegs = new MPVariable[vegs.size()][MEALS.length];
        MPVariable[][] xCarbs = new MPVariable[carbs.size()][MEALS.length];
        // 添加others类型食物决策变量，仅用于午餐(m=1)
        MPVariable[] xOthers = new MPVariable[others.size()];

        // 初始化变量
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                xMeats[i][m] = solver.makeBoolVar("meat_" + i + "_meal_" + m);
            }
        }
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                xVegs[i][m] = solver.makeBoolVar("veg_" + i + "_meal_" + m);
            }
        }
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                xCarbs[i][m] = solver.makeBoolVar("carb_" + i + "_meal_" + m);
            }
        }
        // 初始化others类型食物变量
        for (int i = 0; i < others.size(); i++) {
            xOthers[i] = solver.makeBoolVar("others_" + i);
        }

        // 3. 约束：每餐 1 肉 + 1 菜 + 1 碳水
        for (int m : MEALS) {
            // sum(xMeats[i][m]) = 1
            MPConstraint cMeat = solver.makeConstraint(1, 1, "One_meat_" + m);
            for (int i = 0; i < meats.size(); i++) {
                cMeat.setCoefficient(xMeats[i][m], 1.0);
            }

            // sum(xVegs[i][m]) = 1
            MPConstraint cVeg = solver.makeConstraint(1, 1, "One_veg_" + m);
            for (int i = 0; i < vegs.size(); i++) {
                cVeg.setCoefficient(xVegs[i][m], 1.0);
            }

            // sum(xCarbs[i][m]) = 1
            MPConstraint cCarb = solver.makeConstraint(1, 1, "One_carb_" + m);
            for (int i = 0; i < carbs.size(); i++) {
                cCarb.setCoefficient(xCarbs[i][m], 1.0);
            }
        }

        // 4. 午餐(m=1)选择一个others类型食物
        MPConstraint cOther = solver.makeConstraint(1, 1, "One_others");
        for (int i = 0; i < others.size(); i++) {
            cOther.setCoefficient(xOthers[i], 1.0);
        }

        // 5. 如果 noRepeat = true，则同一天同类食物不能重复
        if (noRepeat) {
            // meats
            for (int i = 0; i < meats.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "No_repeat_meat_" + i);
                for (int m : MEALS) {
                    c.setCoefficient(xMeats[i][m], 1.0);
                }
            }
            // vegs
            for (int i = 0; i < vegs.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "No_repeat_veg_" + i);
                for (int m : MEALS) {
                    c.setCoefficient(xVegs[i][m], 1.0);
                }
            }
            // carbs
            for (int i = 0; i < carbs.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "No_repeat_carb_" + i);
                for (int m : MEALS) {
                    c.setCoefficient(xCarbs[i][m], 1.0);
                }
            }
        }

        // 6. 不再按照固定比例分配卡路里，而是约束总卡路里
        // 放宽约束：总热量在目标热量±5%的范围内即可
        double lowerBound = calorieTarget * 0.95; // 下界为目标热量的95%
        double upperBound = calorieTarget * 1.05; // 上界为目标热量的105%
        MPConstraint cTotalCal = solver.makeConstraint(lowerBound, upperBound, "Total_calorie");
        // 肉类贡献
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                cTotalCal.setCoefficient(xMeats[i][m], meats.get(i).getCaloricValue());
            }
        }
        // 蔬菜贡献
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                cTotalCal.setCoefficient(xVegs[i][m], vegs.get(i).getCaloricValue());
            }
        }
        // 碳水贡献
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                cTotalCal.setCoefficient(xCarbs[i][m], carbs.get(i).getCaloricValue());
            }
        }
        // others食物贡献(仅午餐)
        for (int i = 0; i < others.size(); i++) {
            cTotalCal.setCoefficient(xOthers[i], others.get(i).getCaloricValue());
        }

        // 7. 定义目标函数：最大化总营养密度(若 addRepeatPenalty，则减去一些重复惩罚)
        // 修改为：最小化与目标蛋白质:碳水:脂肪=3:2:8比例的偏差
        MPObjective objective = solver.objective();

        // 创建辅助变量表示总营养素的和
        MPVariable totalNutrients = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_nutrients");
        MPConstraint cNutrientsSum = solver.makeConstraint(0, 0, "nutrients_sum");
        cNutrientsSum.setCoefficient(totalNutrients, -1);
        cNutrientsSum.setCoefficient(totalNutrients, 1);
        cNutrientsSum.setCoefficient(totalNutrients, 1);
        cNutrientsSum.setCoefficient(totalNutrients, 1);

        // 重新设计约束和目标函数
        // 创建表示每种营养素总量的辅助变量
        MPVariable totalProteinVar = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_protein_var");
        MPVariable totalCarbsVar = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_carbs_var");
        MPVariable totalFatVar = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_fat_var");

        // 设置营养素总量约束
        MPConstraint cProteinTotal = solver.makeConstraint(0, 0, "protein_total");
        cProteinTotal.setCoefficient(totalProteinVar, 1);
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                cProteinTotal.setCoefficient(xMeats[i][m], -meats.get(i).getProtein());
            }
        }
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                cProteinTotal.setCoefficient(xVegs[i][m], -vegs.get(i).getProtein());
            }
        }
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                cProteinTotal.setCoefficient(xCarbs[i][m], -carbs.get(i).getProtein());
            }
        }
        for (int i = 0; i < others.size(); i++) {
            cProteinTotal.setCoefficient(xOthers[i], -others.get(i).getProtein());
        }

        MPConstraint cCarbsTotal = solver.makeConstraint(0, 0, "carbs_total");
        cCarbsTotal.setCoefficient(totalCarbsVar, 1);
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                cCarbsTotal.setCoefficient(xMeats[i][m], -meats.get(i).getCarbohydrates());
            }
        }
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                cCarbsTotal.setCoefficient(xVegs[i][m], -vegs.get(i).getCarbohydrates());
            }
        }
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                cCarbsTotal.setCoefficient(xCarbs[i][m], -carbs.get(i).getCarbohydrates());
            }
        }
        for (int i = 0; i < others.size(); i++) {
            cCarbsTotal.setCoefficient(xOthers[i], -others.get(i).getCarbohydrates());
        }

        MPConstraint cFatTotal = solver.makeConstraint(0, 0, "fat_total");
        cFatTotal.setCoefficient(totalFatVar, 1);
        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                cFatTotal.setCoefficient(xMeats[i][m], -meats.get(i).getFat());
            }
        }
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                cFatTotal.setCoefficient(xVegs[i][m], -vegs.get(i).getFat());
            }
        }
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                cFatTotal.setCoefficient(xCarbs[i][m], -carbs.get(i).getFat());
            }
        }
        for (int i = 0; i < others.size(); i++) {
            cFatTotal.setCoefficient(xOthers[i], -others.get(i).getFat());
        }

        // 计算总营养素
        MPVariable totalNutrientsVar = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_nutrients_var");
        MPConstraint cTotalNutrients = solver.makeConstraint(0, 0, "total_nutrients_calc");
        cTotalNutrients.setCoefficient(totalNutrientsVar, 1);
        cTotalNutrients.setCoefficient(totalProteinVar, -1);
        cTotalNutrients.setCoefficient(totalCarbsVar, -1);
        cTotalNutrients.setCoefficient(totalFatVar, -1);

        // 创建偏差变量
        MPVariable proteinRatioDev = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "protein_ratio_dev");
        MPVariable carbsRatioDev = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "carbs_ratio_dev");
        MPVariable fatRatioDev = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "fat_ratio_dev");

        // 设置偏差约束
        // |蛋白质实际比例 - 目标比例| <= proteinRatioDev
        MPConstraint cProteinRatioDev1 = solver.makeConstraint(-Double.POSITIVE_INFINITY, 0, "protein_ratio_dev1");
        cProteinRatioDev1.setCoefficient(totalProteinVar, 1.0);
        cProteinRatioDev1.setCoefficient(totalNutrientsVar, -TARGET_PROTEIN_RATIO);
        cProteinRatioDev1.setCoefficient(proteinRatioDev, -1.0);

        MPConstraint cProteinRatioDev2 = solver.makeConstraint(0, Double.POSITIVE_INFINITY, "protein_ratio_dev2");
        cProteinRatioDev2.setCoefficient(totalProteinVar, 1.0);
        cProteinRatioDev2.setCoefficient(totalNutrientsVar, -TARGET_PROTEIN_RATIO);
        cProteinRatioDev2.setCoefficient(proteinRatioDev, 1.0);

        // |碳水实际比例 - 目标比例| <= carbsRatioDev
        MPConstraint cCarbsRatioDev1 = solver.makeConstraint(-Double.POSITIVE_INFINITY, 0, "carbs_ratio_dev1");
        cCarbsRatioDev1.setCoefficient(totalCarbsVar, 1.0);
        cCarbsRatioDev1.setCoefficient(totalNutrientsVar, -TARGET_CARBS_RATIO);
        cCarbsRatioDev1.setCoefficient(carbsRatioDev, -1.0);

        MPConstraint cCarbsRatioDev2 = solver.makeConstraint(0, Double.POSITIVE_INFINITY, "carbs_ratio_dev2");
        cCarbsRatioDev2.setCoefficient(totalCarbsVar, 1.0);
        cCarbsRatioDev2.setCoefficient(totalNutrientsVar, -TARGET_CARBS_RATIO);
        cCarbsRatioDev2.setCoefficient(carbsRatioDev, 1.0);

        // |脂肪实际比例 - 目标比例| <= fatRatioDev
        MPConstraint cFatRatioDev1 = solver.makeConstraint(-Double.POSITIVE_INFINITY, 0, "fat_ratio_dev1");
        cFatRatioDev1.setCoefficient(totalFatVar, 1.0);
        cFatRatioDev1.setCoefficient(totalNutrientsVar, -TARGET_FAT_RATIO);
        cFatRatioDev1.setCoefficient(fatRatioDev, -1.0);

        MPConstraint cFatRatioDev2 = solver.makeConstraint(0, Double.POSITIVE_INFINITY, "fat_ratio_dev2");
        cFatRatioDev2.setCoefficient(totalFatVar, 1.0);
        cFatRatioDev2.setCoefficient(totalNutrientsVar, -TARGET_FAT_RATIO);
        cFatRatioDev2.setCoefficient(fatRatioDev, 1.0);

        // 设置目标函数为最小化总偏差
        objective.setCoefficient(proteinRatioDev, 1.0);
        objective.setCoefficient(carbsRatioDev, 1.0);
        objective.setCoefficient(fatRatioDev, 1.0);

        // 如果需要考虑重复惩罚，添加适当的惩罚项
        if (addRepeatPenalty) {
            // 肉类
            for (int i = 0; i < meats.size(); i++) {
                double penalty = 0;
                for (int m = 1; m < MEALS.length; m++) {
                    for (int prevM = 0; prevM < m; prevM++) {
                        MPVariable indicator = solver.makeBoolVar("meat_repeat_" + i + "_" + m + "_" + prevM);
                        // indicator表示第i个肉类在餐m和餐prevM都被选中
                        // x[i][m] + x[i][prevM] - 1 <= indicator
                        MPConstraint c1 = solver.makeConstraint(-Double.POSITIVE_INFINITY, 1,
                                "meat_indicator_" + i + "_" + m + "_" + prevM);
                        c1.setCoefficient(xMeats[i][m], 1.0);
                        c1.setCoefficient(xMeats[i][prevM], 1.0);
                        c1.setCoefficient(indicator, -1.0);

                        objective.setCoefficient(indicator, ALPHA); // 添加惩罚
                    }
                }
            }

            // 蔬菜
            for (int i = 0; i < vegs.size(); i++) {
                double penalty = 0;
                for (int m = 1; m < MEALS.length; m++) {
                    for (int prevM = 0; prevM < m; prevM++) {
                        MPVariable indicator = solver.makeBoolVar("veg_repeat_" + i + "_" + m + "_" + prevM);
                        MPConstraint c1 = solver.makeConstraint(-Double.POSITIVE_INFINITY, 1,
                                "veg_indicator_" + i + "_" + m + "_" + prevM);
                        c1.setCoefficient(xVegs[i][m], 1.0);
                        c1.setCoefficient(xVegs[i][prevM], 1.0);
                        c1.setCoefficient(indicator, -1.0);

                        objective.setCoefficient(indicator, ALPHA);
                    }
                }
            }

            // 碳水
            for (int i = 0; i < carbs.size(); i++) {
                double penalty = 0;
                for (int m = 1; m < MEALS.length; m++) {
                    for (int prevM = 0; prevM < m; prevM++) {
                        MPVariable indicator = solver.makeBoolVar("carb_repeat_" + i + "_" + m + "_" + prevM);
                        MPConstraint c1 = solver.makeConstraint(-Double.POSITIVE_INFINITY, 1,
                                "carb_indicator_" + i + "_" + m + "_" + prevM);
                        c1.setCoefficient(xCarbs[i][m], 1.0);
                        c1.setCoefficient(xCarbs[i][prevM], 1.0);
                        c1.setCoefficient(indicator, -1.0);

                        objective.setCoefficient(indicator, ALPHA);
                    }
                }
            }
        }

        objective.setMinimization(); // 设置为最小化目标

        // 将构造好的 solver 和变量等打包返回
        return new ModelData(solver, xMeats, xVegs, xCarbs, xOthers);
    }

    /**
     * 枚举多个可行解，最多收集 maxSolutions 个。
     * 每次求解后，若得到可行解，则添加一个 "排除当前解" 的剪切约束，再继续求解，直到无解或达上限。
     *
     * @return 每个可行解对应的三餐食物列表(外层 list 长度 = 解的数量；内层 = 3；最内层 = 每餐3种食物)
     */
    private List<List<List<String>>> enumerateSolutions(
            ModelData modelData,
            List<Food> meats,
            List<Food> vegs,
            List<Food> carbs,
            List<Food> others,
            int maxSolutions) {
        MPSolver solver = modelData.solver;
        MPVariable[][] xMeats = modelData.xMeats;
        MPVariable[][] xVegs = modelData.xVegs;
        MPVariable[][] xCarbs = modelData.xCarbs;
        MPVariable[] xOthers = modelData.xOthers;

        List<List<List<String>>> solutions = new ArrayList<>();

        while (solutions.size() < maxSolutions) {
            // 1. 求解
            ResultStatus status = solver.solve();
            System.out.println("Solver status: " + status);
            if (status != ResultStatus.OPTIMAL) {
                // 无可行解或非最优 => 退出
                System.out.println("No optimal solution found, exiting solution enumeration");
                break;
            }

            // 2. 读取当前解
            List<List<String>> plan = getSolution(solver, xMeats, xVegs, xCarbs, xOthers, meats, vegs, carbs, others);
            if (plan == null) {
                // 如果无解, 退出
                break;
            }
            solutions.add(plan);

            // 3. 构造 "排除本解" 的剪切约束:
            // sum( (1 - x) if x=1 else x ) >= 1
            // 具体实现: 对于每个变量:
            // 若此解中 x=1 => 系数为 -1, 同时 constantOffset += 1
            // 若此解中 x=0 => 系数为 +1
            // => sum(coeff[i]*x[i]) + offset >= 1
            List<VarVal> chosenVars = new ArrayList<>();
            // meats
            for (int i = 0; i < meats.size(); i++) {
                for (int m : MEALS) {
                    int val = (int) Math.round(xMeats[i][m].solutionValue());
                    chosenVars.add(new VarVal(xMeats[i][m], val));
                }
            }
            // vegs
            for (int i = 0; i < vegs.size(); i++) {
                for (int m : MEALS) {
                    int val = (int) Math.round(xVegs[i][m].solutionValue());
                    chosenVars.add(new VarVal(xVegs[i][m], val));
                }
            }
            // carbs
            for (int i = 0; i < carbs.size(); i++) {
                for (int m : MEALS) {
                    int val = (int) Math.round(xCarbs[i][m].solutionValue());
                    chosenVars.add(new VarVal(xCarbs[i][m], val));
                }
            }

            // others (仅午餐使用)
            for (int i = 0; i < others.size(); i++) {
                int val = (int) Math.round(xOthers[i].solutionValue());
                chosenVars.add(new VarVal(xOthers[i], val));
            }

            // 在 solver 中新加一个约束: sum(coeff * var) >= 1 - offset
            double offset = 0.0;
            MPConstraint cutConstraint = solver.makeConstraint(1, Double.POSITIVE_INFINITY,
                    "CutSolution_" + (solutions.size()));
            for (VarVal vv : chosenVars) {
                if (vv.val == 1) {
                    // (1 - x), 系数是 -1, 并 offset += 1
                    cutConstraint.setCoefficient(vv.var, -1.0);
                    offset += 1.0;
                } else {
                    // x, 系数是 +1
                    cutConstraint.setCoefficient(vv.var, 1.0);
                }
            }
            // 因为 sum(coeff*var) + offset >= 1 等价于 sum(coeff*var) >= 1 - offset
            // 所以要调整下约束的下界
            double lb = 1.0 - offset;
            cutConstraint.setLb(lb);
        }

        System.out.println("Enumerated: " + solutions.size() + " solutions");
        return solutions;
    }

    /**
     * 从求解完成的 solver 中读取各餐选了哪些食物。
     *
     * @return plan: size=3 的列表，每餐对应 [meat, veg, carb] (字符串), 若无解返回 null
     */
    private List<List<String>> getSolution(
            MPSolver solver,
            MPVariable[][] xMeats,
            MPVariable[][] xVegs,
            MPVariable[][] xCarbs,
            MPVariable[] xOthers,
            List<Food> meats,
            List<Food> vegs,
            List<Food> carbs,
            List<Food> others) {
        // 如果解不可行
        if (solver.objective() == null) {
            return null;
        }

        // 三餐
        List<List<String>> plan = new ArrayList<>(3);
        for (int m = 0; m < 3; m++) {
            List<String> items = new ArrayList<>(3);

            // meats
            int chosenMeat = -1;
            for (int i = 0; i < meats.size(); i++) {
                if (Math.round(xMeats[i][m].solutionValue()) == 1) {
                    chosenMeat = i;
                    break;
                }
            }
            if (chosenMeat >= 0) {
                items.add(meats.get(chosenMeat).getFood());
            }

            // vegs
            int chosenVeg = -1;
            for (int i = 0; i < vegs.size(); i++) {
                if (Math.round(xVegs[i][m].solutionValue()) == 1) {
                    chosenVeg = i;
                    break;
                }
            }
            if (chosenVeg >= 0) {
                items.add(vegs.get(chosenVeg).getFood());
            }

            // carbs
            int chosenCarb = -1;
            for (int i = 0; i < carbs.size(); i++) {
                if (Math.round(xCarbs[i][m].solutionValue()) == 1) {
                    chosenCarb = i;
                    break;
                }
            }
            if (chosenCarb >= 0) {
                items.add(carbs.get(chosenCarb).getFood());
            }

            // 如果是午餐(m=1)，添加选中的others食物
            if (m == 1) {
                for (int i = 0; i < others.size(); i++) {
                    if (Math.round(xOthers[i].solutionValue()) == 1) {
                        items.add(others.get(i).getFood());
                    }
                }
            }

            plan.add(items);
        }

        return plan;
    }

    // === 一些简化写法的"布尔型"辅助方法 ===
    private boolean noRepeat(boolean v) {
        return v;
    }

    private boolean addRepeatPenalty(boolean v) {
        return v;
    }

    private int maxSolutions(int k) {
        return k;
    }

    /**
     * 内部数据结构，打包 solver 与变量
     */
    static class ModelData {
        MPSolver solver;
        MPVariable[][] xMeats;
        MPVariable[][] xVegs;
        MPVariable[][] xCarbs;
        MPVariable[] xOthers;

        public ModelData(MPSolver solver,
                MPVariable[][] xMeats,
                MPVariable[][] xVegs,
                MPVariable[][] xCarbs,
                MPVariable[] xOthers) {
            this.solver = solver;
            this.xMeats = xMeats;
            this.xVegs = xVegs;
            this.xCarbs = xCarbs;
            this.xOthers = xOthers;
        }
    }

    /**
     * 内部数据结构，用于保存"某个变量在当前解中取值"的信息
     */
    static class VarVal {
        MPVariable var;
        int val; // 0 or 1

        VarVal(MPVariable var, int val) {
            this.var = var;
            this.val = val;
        }
    }
}
