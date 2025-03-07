package com.example.diettracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.diettracker.service.MealPlanService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
public class MealPlanController {

    @Autowired
    private MealPlanService mealPlanService;

    @GetMapping({ "/api/recommend", "/api/meal/recommend" })
    public ResponseEntity<?> getMealPlan(
            @RequestParam(value = "calorieTarget", defaultValue = "2000") double calorieTarget) {
        System.out.println("Request received: calorieTarget = " + calorieTarget);
        try {
            List<List<String>> mealPlan = mealPlanService.mealPlanRecommendation(calorieTarget);
            if (mealPlan == null) {
                System.out.println("Final recommendation: No feasible solution found");
            } else if (mealPlan.isEmpty()) {
                System.out.println("Final recommendation: Empty list");
            } else {
                System.out.println("Final recommendation: 1 complete meal plan");
                System.out.println("  Breakfast: " + String.join(", ", mealPlan.get(0)));
                System.out.println("  Lunch: " + String.join(", ", mealPlan.get(1)));
                System.out.println("  Dinner: " + String.join(", ", mealPlan.get(2)));
            }

            if (mealPlan != null && !mealPlan.isEmpty()) {
                return ResponseEntity.ok(mealPlan);
            } else {
                System.out.println("Response to client: No feasible solution");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No feasible meal plan found for the given constraints.");
            }
        } catch (Exception e) {
            System.out.println("处理请求时发生异常: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("处理请求时发生错误: " + e.getMessage());
        }
    }

    // 添加一个简单的测试接口
    @GetMapping("/api/recommend/test")
    public String test() {
        return "API正常工作！";
    }
}
