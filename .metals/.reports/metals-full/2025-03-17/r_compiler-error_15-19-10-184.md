file://<WORKSPACE>/src/main/java/com/example/diettracker/service/MealPlanService.java
### java.util.NoSuchElementException: next on empty iterator

occurred in the presentation compiler.

presentation compiler configuration:


action parameters:
offset: 3156
uri: file://<WORKSPACE>/src/main/java/com/example/diettracker/service/MealPlanService.java
text:
```scala
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

/*
 * Min: |protein_ratio - 0.3| + |carbs_ratio - 0.2| + |fat_ratio - 0.5| +
 * 0.1 * Σ(meat_repeat_penalty) +
 * 0.1 * Σ(veg_repeat_penalty) +
 * 0.1 * Σ(carb_repeat_penalty)
 */
@Service
public class MealPlanService {

    @Autowired
    private FoodRepository foodRepository;

    private static final int[] MEALS = { 0, 1, 2 }; // 三餐编码: 0=早餐,1=午餐,2=晚餐
    private static final double ALPHA = 0.1; // 重复使用的惩罚系数(示例)
    private static final double TARGET_PROTEIN_RATIO = 0.2; // 蛋白质占比 30%
    private static final double TARGET_CARBS_RATIO = 0.5; // 碳水占比 20%
    private static final double TARGET_FAT_RATIO = 0.3; // 脂肪占比 50%
    private static final long STAGE2_TIMEOUT_MS = 10000; // 10秒超时

    /**
     * 主入口：根据用户传入的体重、身高和年龄，计算 TDEE (BMR * 1.55)，再减 500 得到 calorieTarget。
     * 然后按照原先两阶段求解逻辑，返回三餐的食物列表 (每餐 [meat, veg, carb])。
     * 若无解，返回 null。
     */
    public List<List<String>> mealPlanRecommendation(double weight, double height, int age) {
        // 1. 计算 BMR (Mifflin-St Jeor, 男性版本)
        double bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;

        // 2. 固定活动系数 = 1.55
        double tdee = bmr * 1.55;

        // 3. 最终卡路里目标 = TDEE - 500
        double calorieTarget = tdee - 500;

        System.out.println("Computed BMR=" + bmr + ", TDEE=" + tdee + ", final calorieTarget=" + calorieTarget);

        // =========== 以下为原先逻辑不变 ===========

        // 读取全部食物
        List<Food> allFoods = foodRepository.findAll();
        System.out.println("Current food database size: " + allFoods.size());

        // 根据 category 分组
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

        // 第1阶段：只考虑热量约束
        System.out.println("Stage 1: Simplified optimization");
        ModelData simplifiedModel = buildSimplifiedProblem(
                meats, vegs, car@@bs, others,
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
            // 第2阶段：在第一阶段解的基础上优化营养素比例
            System.out.println("Starting Stage 2 optimization: Nutrient ratios");
            List<List<List<String>>> finalSolutions = new ArrayList<>();

            // 添加超时控制
            long startTime = System.currentTimeMillis();

            for (List<List<String>> baselineSolution : firstStageSolutions) {
                // 检查是否超时
                if (System.currentTimeMillis() - startTime > STAGE2_TIMEOUT_MS) {
                    System.out.println("Stage 2 timeout after " + STAGE2_TIMEOUT_MS + "ms, using stage 1 solutions");
                    break;
                }

                ModelData refinedModel = buildDailyMealProblem(
                        meats, vegs, carbs, others,
                        calorieTarget,
                        noRepeat(true),
                        addRepeatPenalty(true),
                        baselineSolution);

                List<List<List<String>>> improvedSolutions = enumerateSolutions(
                        refinedModel,
                        meats, vegs, carbs, others,
                        maxSolutions(1));

                if (!improvedSolutions.isEmpty()) {
                    finalSolutions.add(improvedSolutions.get(0));
                    if (finalSolutions.size() >= 3) {
                        break;
                    }
                }
            }

            System.out.println("Stage 2 results: Generated " + finalSolutions.size()
                    + " candidate plans, will randomly select 1 as recommendation");

            if (!finalSolutions.isEmpty()) {
                Random rand = new Random();
                return finalSolutions.get(rand.nextInt(finalSolutions.size()));
            } else if (!firstStageSolutions.isEmpty()) {
                // 如果第二阶段无解，直接返回第一阶段的解
                System.out.println("No Stage 2 solutions, returning Stage 1 solution instead");
                Random rand = new Random();
                return firstStageSolutions.get(rand.nextInt(firstStageSolutions.size()));
            }
        }

        // 若两阶段失败，则直接回退到单阶段方式

        // (1) 尝试硬约束 "不重复"
        ModelData modelData1 = buildDailyMealProblem(
                meats, vegs, carbs, others,
                calorieTarget,
                noRepeat(true),
                addRepeatPenalty(false),
                null);
        List<List<List<String>>> solutions1 = enumerateSolutions(
                modelData1,
                meats, vegs, carbs, others,
                maxSolutions(3));
        System.out.println("Mode 1 (hard constraint, no repeat) results: "
                + (solutions1.isEmpty() ? "No solution" : "Found " + solutions1.size() + " solutions"));

        if (!solutions1.isEmpty()) {
            Random rand = new Random();
            return solutions1.get(rand.nextInt(solutions1.size()));
        }

        // (2) 再尝试软约束
        ModelData modelData2 = buildDailyMealProblem(
                meats, vegs, carbs, others,
                calorieTarget,
                noRepeat(false),
                addRepeatPenalty(true),
                null);
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

        // (3) 最后再去掉所有重复约束
        ModelData modelData3 = buildDailyMealProblem(
                meats, vegs, carbs, others,
                calorieTarget,
                noRepeat(false),
                addRepeatPenalty(false),
                null);
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

        // 实在无解，返回空
        return Collections.emptyList();
    }

    /**
     * 构建第一阶段简化问题 - 只考虑热量约束
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

        // 每餐至少选择1肉+1菜+1碳水
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

        // 午餐选1个others
        MPConstraint cOther = solver.makeConstraint(1, 1, "one_other");
        for (int i = 0; i < others.size(); i++) {
            cOther.setCoefficient(xOthers[i], 1);
        }

        // 热量约束: [0.95 * calorieTarget, 1.05 * calorieTarget]
        MPConstraint cCalLower = solver.makeConstraint(0.95 * calorieTarget, Double.POSITIVE_INFINITY, "cal_lower");
        MPConstraint cCalUpper = solver.makeConstraint(0, 1.05 * calorieTarget, "cal_upper");

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

        // 不重复约束
        if (noRepeat) {
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

        // 目标：最小化与目标热量差距
        MPObjective objective = solver.objective();
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
        cDevCalNeg.setBounds(-calorieTarget, Double.POSITIVE_INFINITY);

        objective.setCoefficient(calDev, 1);
        objective.setMinimization();

        return new ModelData(solver, xMeats, xVegs, xCarbs, xOthers);
    }

    /**
     * 构建完整问题，优化营养素比例等
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

        System.out.println("Building problem: calorieTarget=" + calorieTarget
                + ", noRepeat=" + noRepeat
                + ", addRepeatPenalty=" + addRepeatPenalty);

        MPSolver solver = new MPSolver(
                "DailyMealPlan",
                MPSolver.OptimizationProblemType.CBC_MIXED_INTEGER_PROGRAMMING);

        // 设置超时时间 - 5秒
        solver.setTimeLimit(5000);

        MPVariable[][] xMeats = new MPVariable[meats.size()][MEALS.length];
        MPVariable[][] xVegs = new MPVariable[vegs.size()][MEALS.length];
        MPVariable[][] xCarbs = new MPVariable[carbs.size()][MEALS.length];
        MPVariable[] xOthers = new MPVariable[others.size()];

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
        for (int i = 0; i < others.size(); i++) {
            xOthers[i] = solver.makeBoolVar("others_" + i);
        }

        // 每餐1肉+1菜+1碳水
        for (int m : MEALS) {
            MPConstraint cMeat = solver.makeConstraint(1, 1, "One_meat_" + m);
            for (int i = 0; i < meats.size(); i++) {
                cMeat.setCoefficient(xMeats[i][m], 1.0);
            }

            MPConstraint cVeg = solver.makeConstraint(1, 1, "One_veg_" + m);
            for (int i = 0; i < vegs.size(); i++) {
                cVeg.setCoefficient(xVegs[i][m], 1.0);
            }

            MPConstraint cCarb = solver.makeConstraint(1, 1, "One_carb_" + m);
            for (int i = 0; i < carbs.size(); i++) {
                cCarb.setCoefficient(xCarbs[i][m], 1.0);
            }
        }

        // 午餐选 1 others
        MPConstraint cOther = solver.makeConstraint(1, 1, "One_others");
        for (int i = 0; i < others.size(); i++) {
            cOther.setCoefficient(xOthers[i], 1.0);
        }

        // 如果 noRepeat，则同类食材不得重复
        if (noRepeat) {
            for (int i = 0; i < meats.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "No_repeat_meat_" + i);
                for (int m : MEALS) {
                    c.setCoefficient(xMeats[i][m], 1.0);
                }
            }
            for (int i = 0; i < vegs.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "No_repeat_veg_" + i);
                for (int m : MEALS) {
                    c.setCoefficient(xVegs[i][m], 1.0);
                }
            }
            for (int i = 0; i < carbs.size(); i++) {
                MPConstraint c = solver.makeConstraint(0, 1, "No_repeat_carb_" + i);
                for (int m : MEALS) {
                    c.setCoefficient(xCarbs[i][m], 1.0);
                }
            }
        }

        // 总热量区间 [0.9*calorieTarget, 1.1*calorieTarget] - 放宽到±10%
        double lowerBound = calorieTarget * 0.9;
        double upperBound = calorieTarget * 1.1;
        MPConstraint cTotalCal = solver.makeConstraint(lowerBound, upperBound, "Total_calorie");

        for (int i = 0; i < meats.size(); i++) {
            for (int m : MEALS) {
                cTotalCal.setCoefficient(xMeats[i][m], meats.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < vegs.size(); i++) {
            for (int m : MEALS) {
                cTotalCal.setCoefficient(xVegs[i][m], vegs.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < carbs.size(); i++) {
            for (int m : MEALS) {
                cTotalCal.setCoefficient(xCarbs[i][m], carbs.get(i).getCaloricValue());
            }
        }
        for (int i = 0; i < others.size(); i++) {
            cTotalCal.setCoefficient(xOthers[i], others.get(i).getCaloricValue());
        }

        // 定义目标：最小化营养素比例偏差
        MPObjective objective = solver.objective();

        MPVariable totalNutrients = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_nutrients");
        MPConstraint cNutrientsSum = solver.makeConstraint(0, 0, "nutrients_sum");
        cNutrientsSum.setCoefficient(totalNutrients, -1);
        cNutrientsSum.setCoefficient(totalNutrients, 1);
        cNutrientsSum.setCoefficient(totalNutrients, 1);
        cNutrientsSum.setCoefficient(totalNutrients, 1);

        MPVariable totalProteinVar = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_protein_var");
        MPVariable totalCarbsVar = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_carbs_var");
        MPVariable totalFatVar = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_fat_var");

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

        MPVariable totalNutrientsVar = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "total_nutrients_var");
        MPConstraint cTotalNutrients = solver.makeConstraint(0, 0, "total_nutrients_calc");
        cTotalNutrients.setCoefficient(totalNutrientsVar, 1);
        cTotalNutrients.setCoefficient(totalProteinVar, -1);
        cTotalNutrients.setCoefficient(totalCarbsVar, -1);
        cTotalNutrients.setCoefficient(totalFatVar, -1);

        // 偏差变量
        MPVariable proteinRatioDev = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "protein_ratio_dev");
        MPVariable carbsRatioDev = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "carbs_ratio_dev");
        MPVariable fatRatioDev = solver.makeNumVar(0, Double.POSITIVE_INFINITY, "fat_ratio_dev");

        // 修改营养素比例约束，将硬性相等约束改为允许一定偏差的范围约束
        // 设置允许的偏差范围为 ±0.15（这个值可以调整）
        double allowedDeviation = 0.5;

        MPConstraint cProteinRatioLower = solver.makeConstraint(
                TARGET_PROTEIN_RATIO - allowedDeviation,
                Double.POSITIVE_INFINITY,
                "protein_ratio_lower");
        cProteinRatioLower.setCoefficient(totalProteinVar, 1.0);
        cProteinRatioLower.setCoefficient(totalNutrientsVar, -TARGET_PROTEIN_RATIO + allowedDeviation);

        MPConstraint cProteinRatioUpper = solver.makeConstraint(
                Double.NEGATIVE_INFINITY,
                TARGET_PROTEIN_RATIO + allowedDeviation,
                "protein_ratio_upper");
        cProteinRatioUpper.setCoefficient(totalProteinVar, 1.0);
        cProteinRatioUpper.setCoefficient(totalNutrientsVar, -TARGET_PROTEIN_RATIO - allowedDeviation);

        MPConstraint cCarbsRatioLower = solver.makeConstraint(
                TARGET_CARBS_RATIO - allowedDeviation,
                Double.POSITIVE_INFINITY,
                "carbs_ratio_lower");
        cCarbsRatioLower.setCoefficient(totalCarbsVar, 1.0);
        cCarbsRatioLower.setCoefficient(totalNutrientsVar, -TARGET_CARBS_RATIO + allowedDeviation);

        MPConstraint cCarbsRatioUpper = solver.makeConstraint(
                Double.NEGATIVE_INFINITY,
                TARGET_CARBS_RATIO + allowedDeviation,
                "carbs_ratio_upper");
        cCarbsRatioUpper.setCoefficient(totalCarbsVar, 1.0);
        cCarbsRatioUpper.setCoefficient(totalNutrientsVar, -TARGET_CARBS_RATIO - allowedDeviation);

        MPConstraint cFatRatioLower = solver.makeConstraint(
                TARGET_FAT_RATIO - allowedDeviation,
                Double.POSITIVE_INFINITY,
                "fat_ratio_lower");
        cFatRatioLower.setCoefficient(totalFatVar, 1.0);
        cFatRatioLower.setCoefficient(totalNutrientsVar, -TARGET_FAT_RATIO + allowedDeviation);

        MPConstraint cFatRatioUpper = solver.makeConstraint(
                Double.NEGATIVE_INFINITY,
                TARGET_FAT_RATIO + allowedDeviation,
                "fat_ratio_upper");
        cFatRatioUpper.setCoefficient(totalFatVar, 1.0);
        cFatRatioUpper.setCoefficient(totalNutrientsVar, -TARGET_FAT_RATIO - allowedDeviation);

        // 保留软约束偏差变量，但降低其在目标函数中的权重
        objective.setCoefficient(proteinRatioDev, 0.5); // 从原来的1.0降低
        objective.setCoefficient(carbsRatioDev, 0.5);
        objective.setCoefficient(fatRatioDev, 0.5);

        if (addRepeatPenalty) {
            for (int i = 0; i < meats.size(); i++) {
                for (int m = 1; m < MEALS.length; m++) {
                    for (int prevM = 0; prevM < m; prevM++) {
                        MPVariable indicator = solver.makeBoolVar("meat_repeat_" + i + "_" + m + "_" + prevM);
                        MPConstraint c1 = solver.makeConstraint(-Double.POSITIVE_INFINITY, 1,
                                "meat_indicator_" + i + "_" + m + "_" + prevM);
                        c1.setCoefficient(xMeats[i][m], 1.0);
                        c1.setCoefficient(xMeats[i][prevM], 1.0);
                        c1.setCoefficient(indicator, -1.0);
                        objective.setCoefficient(indicator, ALPHA);
                    }
                }
            }

            for (int i = 0; i < vegs.size(); i++) {
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

            for (int i = 0; i < carbs.size(); i++) {
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

        objective.setMinimization();
        return new ModelData(solver, xMeats, xVegs, xCarbs, xOthers);
    }

    /**
     * 枚举多个可行解，最多收集 maxSolutions 个
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

        // 设置最大迭代次数，避免无限循环
        int maxIterations = 10;
        int iterations = 0;

        while (solutions.size() < maxSolutions && iterations < maxIterations) {
            iterations++;
            ResultStatus status = solver.solve();
            System.out.println("Solver status: " + status);

            // 接受FEASIBLE解作为有效解
            if (status != ResultStatus.OPTIMAL && status != ResultStatus.FEASIBLE) {
                System.out.println(
                        "No optimal solution found, exiting solution enumeration after " + iterations + " iterations");
                break;
            }

            List<List<String>> plan = getSolution(solver, xMeats, xVegs, xCarbs, xOthers, meats, vegs, carbs, others);
            if (plan == null) {
                break;
            }
            solutions.add(plan);

            // 添加剪切约束，避免得到同样的解
            List<VarVal> chosenVars = new ArrayList<>();
            for (int i = 0; i < meats.size(); i++) {
                for (int m : MEALS) {
                    int val = (int) Math.round(xMeats[i][m].solutionValue());
                    chosenVars.add(new VarVal(xMeats[i][m], val));
                }
            }
            for (int i = 0; i < vegs.size(); i++) {
                for (int m : MEALS) {
                    int val = (int) Math.round(xVegs[i][m].solutionValue());
                    chosenVars.add(new VarVal(xVegs[i][m], val));
                }
            }
            for (int i = 0; i < carbs.size(); i++) {
                for (int m : MEALS) {
                    int val = (int) Math.round(xCarbs[i][m].solutionValue());
                    chosenVars.add(new VarVal(xCarbs[i][m], val));
                }
            }
            for (int i = 0; i < others.size(); i++) {
                int val = (int) Math.round(xOthers[i].solutionValue());
                chosenVars.add(new VarVal(xOthers[i], val));
            }

            double offset = 0.0;
            MPConstraint cutConstraint = solver.makeConstraint(1, Double.POSITIVE_INFINITY,
                    "CutSolution_" + (solutions.size()));
            for (VarVal vv : chosenVars) {
                if (vv.val == 1) {
                    cutConstraint.setCoefficient(vv.var, -1.0);
                    offset += 1.0;
                } else {
                    cutConstraint.setCoefficient(vv.var, 1.0);
                }
            }
            double lb = 1.0 - offset;
            cutConstraint.setLb(lb);
        }

        System.out.println("Enumerated: " + solutions.size() + " solutions in " + iterations + " iterations");
        return solutions;
    }

    /**
     * 获取 solver 中 0/1 变量对应的三餐食材选择
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

        if (solver.objective() == null) {
            return null;
        }
        List<List<String>> plan = new ArrayList<>(3);
        for (int m = 0; m < 3; m++) {
            List<String> items = new ArrayList<>(3);

            // 选中哪种 meat
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

            // 选中哪种 veg
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

            // 选中哪种 carb
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

            // 午餐加1个others
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

    private boolean noRepeat(boolean v) {
        return v;
    }

    private boolean addRepeatPenalty(boolean v) {
        return v;
    }

    private int maxSolutions(int k) {
        return k;
    }

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

    static class VarVal {
        MPVariable var;
        int val;

        VarVal(MPVariable var, int val) {
            this.var = var;
            this.val = val;
        }
    }
}
```



#### Error stacktrace:

```
scala.collection.Iterator$$anon$19.next(Iterator.scala:973)
	scala.collection.Iterator$$anon$19.next(Iterator.scala:971)
	scala.collection.mutable.MutationTracker$CheckedIterator.next(MutationTracker.scala:76)
	scala.collection.IterableOps.head(Iterable.scala:222)
	scala.collection.IterableOps.head$(Iterable.scala:222)
	scala.collection.AbstractIterable.head(Iterable.scala:935)
	dotty.tools.dotc.interactive.InteractiveDriver.run(InteractiveDriver.scala:164)
	dotty.tools.pc.MetalsDriver.run(MetalsDriver.scala:45)
	dotty.tools.pc.HoverProvider$.hover(HoverProvider.scala:40)
	dotty.tools.pc.ScalaPresentationCompiler.hover$$anonfun$1(ScalaPresentationCompiler.scala:376)
```
#### Short summary: 

java.util.NoSuchElementException: next on empty iterator