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
 * Ensure that the OR-Tools native library is loaded in the project.
 * For example, call Loader.loadNativeLibraries() in the main method or configuration class.
 */

/*
 * Min: |protein_ratio - 0.3| + |carbs_ratio - 0.2| + |fat_ratio - 0.5| +
 * 0.1 * Σ(meat_repeat_penalty) +
 * 0.1 * Σ(veg_repeat_penalty) +
 * 0.1 * Σ(carb_repeat_penalty)
 */
@Service
public class LossWeightDietService {

    @Autowired
    private FoodRepository foodRepository;

    private static final int[] MEALS = { 0, 1, 2 }; // Meal codes: 0=breakfast, 1=lunch, 2=dinner
    private static final double ALPHA = 0.1; // Penalty factor for repeated usage (example)
    private static final double TARGET_PROTEIN_RATIO = 0.2; // 20% protein ratio
    private static final double TARGET_CARBS_RATIO = 0.5; // 50% carbohydrate ratio
    private static final double TARGET_FAT_RATIO = 0.3; // 30% fat ratio
    private static final long STAGE2_TIMEOUT_MS = 10000; // 10-second timeout

    /**
     * 主入口：根据用户传入的体重、身高和年龄，计算 TDEE (BMR * 1.55)，再减 500 得到 calorieTarget。
     * 然后按照原先两阶段求解逻辑，返回三餐的食物列表 (每餐 [meat, veg, carb])。
     * 若无解，返回 null。
     */
    public List<List<String>> mealPlanRecommendation(double weight, double height, int age) {
        // 1. Calculate BMR (Mifflin-St Jeor, male version)
        double bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;

        // 2. Fixed activity factor = 1.55
        double tdee = bmr * 1.55;

        // 3. Final calorie target = TDEE - 500
        double calorieTarget = tdee - 500;

        System.out.println("Computed BMR=" + bmr + ", TDEE=" + tdee + ", final calorieTarget=" + calorieTarget);

        // =========== The following logic remains unchanged ===========

        // Read all foods
        List<Food> allFoods = foodRepository.findAll();
        System.out.println("Current food database size: " + allFoods.size());

        // Group by category
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

        // Stage 1: only consider calorie constraints
        System.out.println("Stage 1: Simplified optimization");
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
            // Attempt to relax constraints - allow repeated foods
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
            // Stage 2: optimize nutrient ratios based on stage 1 solutions
            System.out.println("Starting Stage 2 optimization: Nutrient ratios");
            List<List<List<String>>> finalSolutions = new ArrayList<>();

            // Add timeout control
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
                // If stage 2 has no solution, return the stage 1 solution
                System.out.println("No Stage 2 solutions, returning Stage 1 solution instead");
                Random rand = new Random();
                return firstStageSolutions.get(rand.nextInt(firstStageSolutions.size()));
            }
        }

        // If both stages fail, revert to a single-stage approach

        // (1) Try a strict no-repeat constraint
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

        // (2) Then try a soft constraint
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

        // (3) Finally, remove all repeat constraints
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

        // If no solution is found, return empty
        return Collections.emptyList();
    }

    /**
     * Build stage 1 simplified problem - only consider calorie constraints
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

        // Each meal requires at least one meat, one vegetable, and one carbohydrate
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

        // Lunch selects one 'others'
        MPConstraint cOther = solver.makeConstraint(1, 1, "one_other");
        for (int i = 0; i < others.size(); i++) {
            cOther.setCoefficient(xOthers[i], 1);
        }

        // Calorie constraint: [0.95 * calorieTarget, 1.05 * calorieTarget]
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

        // No-repeat constraint
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

        // Objective: minimize deviation from target calories
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
     * Build the full problem to optimize nutrient ratios, etc.
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

        // Set a 5-second timeout
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

        // Each meal has one meat, one vegetable, and one carbohydrate
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

        // Lunch selects one 'others'
        MPConstraint cOther = solver.makeConstraint(1, 1, "One_others");
        for (int i = 0; i < others.size(); i++) {
            cOther.setCoefficient(xOthers[i], 1.0);
        }

        // If noRepeat is true, do not repeat items from the same category
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

        // Total calorie range [0.9 * calorieTarget, 1.1 * calorieTarget] with ±10% flexibility
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

        // Define the objective: minimize nutrient ratio deviation
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

        // Modify nutrient ratio constraints from exact equality to allow some deviation
        // Set allowed deviation range to ±0.5 (this value can be adjusted)
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

        // Keep the soft constraint deviation variables but lower their weight in the objective function
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
     * Enumerate multiple feasible solutions, up to maxSolutions
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

        // Set a maximum iteration limit to avoid infinite loops
        int maxIterations = 10;
        int iterations = 0;

        while (solutions.size() < maxSolutions && iterations < maxIterations) {
            iterations++;
            ResultStatus status = solver.solve();
            System.out.println("Solver status: " + status);

            // Accept FEASIBLE solutions as valid
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

            // Add a cutting constraint to avoid identical solutions
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
     * Retrieve the meal plan from the solver's 0/1 variables
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