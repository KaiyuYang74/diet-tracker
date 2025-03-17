file://<WORKSPACE>/src/main/java/com/example/diettracker/service/BuildMuscleService.java
### java.util.NoSuchElementException: next on empty iterator

occurred in the presentation compiler.

presentation compiler configuration:


action parameters:
offset: 3205
uri: file://<WORKSPACE>/src/main/java/com/example/diettracker/service/BuildMuscleService.java
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
 * 增肌饮食服务，通过更高的蛋白质比例帮助用户增加肌肉
 */

/*
 * Min: |protein_ratio - 0.4| + |carbs_ratio - 0.4| + |fat_ratio - 0.2| +
 * 0.1 * Σ(meat_repeat_penalty) +
 * 0.1 * Σ(veg_repeat_penalty) +
 * 0.1 * Σ(carb_repeat_penalty)
 */
@Service
public class BuildMuscleService {

    @Autowired
    private FoodRepository foodRepository;

    private static final int[] MEALS = { 0, 1, 2 }; // 三餐编码: 0=早餐,1=午餐,2=晚餐
    private static final double ALPHA = 0.1; // 重复使用的惩罚系数(示例)
    private static final double TARGET_PROTEIN_RATIO = 0.4; // 蛋白质占比 40%
    private static final double TARGET_CARBS_RATIO = 0.4; // 碳水占比 40%
    private static final double TARGET_FAT_RATIO = 0.2; // 脂肪占比 20%
    private static final long STAGE2_TIMEOUT_MS = 10000; // 10秒超时

    /**
     * 主入口：根据用户传入的体重、身高和年龄，计算 TDEE (BMR * 1.55)，保持TDEE水平
     * 然后按照两阶段求解逻辑，返回三餐的食物列表 (每餐 [meat, veg, carb])。
     * 若无解，返回 null。
     */
    public List<List<String>> mealPlanRecommendation(double weight, double height, int age) {
        // 1. 计算 BMR (Mifflin-St Jeor, 男性版本)
        double bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;

        // 2. 固定活动系数 = 1.55
        double tdee = bmr * 1.55;

        // 3. 最终卡路里目标 = TDEE (维持但调整营养素比例)
        double calorieTarget = tdee;

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
                .filter(f -> !"meats".equalsIgnoreCase(f.getCategory()) &&
                        !"vegetables".equalsIgnoreCase(f.getCategory()) &&
                        !"carbs".equalsIgnoreCase(f.getCategory()))
                .collect(Collectors.toList());

        System.out.println("Meats: " + meats.size() + ", Vegs: " + vegs.size() +
                ", Carbs: " + carbs.size() + ", Others: " + others.size());

@@        // 第一阶段：使用简单问题求解，不添加重复惩罚
        ModelData modelData = buildSimplifiedProblem(meats, vegs, carbs, others, calorieTarget, noRepeat(false));
        if (solver(modelData) == MPSolver.ResultStatus.OPTIMAL) {
            // 第一阶段有解，取出解保存为 baseline
            List<List<String>> baselineSolution = getSolution(
                    modelData.solver,
                    modelData.xMeats,
                    modelData.xVegs,
                    modelData.xCarbs,
                    modelData.xOthers,
                    meats, vegs, carbs, others);

            System.out.println("First stage solution found, trying to improve with penalties in second stage...");

            // 第二阶段：带重复惩罚的完整版问题，以 baseline 为初始解，解出带惩罚更优的解
            ModelData modelData2 = buildDailyMealProblem(
                    meats, vegs, carbs, others,
                    calorieTarget,
                    noRepeat(false),
                    addRepeatPenalty(true),
                    baselineSolution);

            // 设置超时，避免求解时间过长
            modelData2.solver.setTimeLimit(STAGE2_TIMEOUT_MS);

            if (solver(modelData2) == MPSolver.ResultStatus.OPTIMAL) {
                // 第二阶段找到了 Optimal 解，用这个结果
                System.out.println("Second stage optimal solution found!");
                return getSolution(
                        modelData2.solver,
                        modelData2.xMeats,
                        modelData2.xVegs,
                        modelData2.xCarbs,
                        modelData2.xOthers,
                        meats, vegs, carbs, others);
            } else if (solver(modelData2) == MPSolver.ResultStatus.FEASIBLE) {
                // 第二阶段找到了 Feasible 解，也可以用
                System.out.println("Second stage feasible solution found!");
                return getSolution(
                        modelData2.solver,
                        modelData2.xMeats,
                        modelData2.xVegs,
                        modelData2.xCarbs,
                        modelData2.xOthers,
                        meats, vegs, carbs, others);
            } else {
                // 第二阶段无解，回退使用第一阶段的 baseline 解
                System.out.println("Second stage has no solution, fallback to first stage solution");
                return baselineSolution;
            }
        } else {
            // 简单无约束问题都无解，说明卡路里需求实在无法满足
            System.out.println("No solution found even in first simplified stage");
            return null;
        }
    }

    // 这里需要复制其他辅助方法、内部类等
    // 具体需要复制LossWeightDietService中的相应部分
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