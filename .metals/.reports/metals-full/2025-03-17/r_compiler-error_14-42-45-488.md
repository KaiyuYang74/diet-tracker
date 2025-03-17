file://<WORKSPACE>/src/main/java/com/example/diettracker/controller/MealPlanController.java
### java.util.NoSuchElementException: next on empty iterator

occurred in the presentation compiler.

presentation compiler configuration:


action parameters:
offset: 2491
uri: file://<WORKSPACE>/src/main/java/com/example/diettracker/controller/MealPlanController.java
text:
```scala
package com.example.diettracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    /**
     * 获取餐饮计划（GET方法）
     * 改为接收 weight, height, age
     */
    @GetMapping({ "/api/recommend", "/api/meal/recommend" })
    public ResponseEntity<?> getMealPlan(
            @RequestParam(value = "weight") double weight,
            @RequestParam(value = "height") double height,
            @RequestParam(value = "age") int age) {

        System.out.println("GET Request received: weight=" + weight + ", height=" + height + ", age=" + age);
        return processMealPlanRequest(weight, height, age);
    }

    /**
     * 获取餐饮计划（POST方法）
     * 接收JSON请求体，包含体重/身高/年龄
     */
    @PostMapping({ "/api/recommend", "/api/meal/recommend" })
    public ResponseEntity<?> postMealPlan(@RequestBody MealPlanRequest request) {
        System.out.println("POST Request received: weight=" + request.getWeight() +
                ", height=" + request.getHeight() + ", age=" + request.getAge());
        return processMealPlanRequest(request.getWeight(), request.getHeight(), request.getAge());
    }

    /**
     * 处理餐饮计划请求的通用方法
     */
    private ResponseEntity<?> processMealPlanRequest(double weight, double height, int age) {
        try {
            List<List<String>> mealPlan = mealPlanService.mealPlanRecommendation(weight, height, age);
            if (mealPlan == null) {
                System.out.println("Final recommendation: No feasible solution found");
            } else if (mealPlan.isEmpty()) {
                System.out.println("Final recommendation: Empty list");
            } else {
                System.out.println("Final recommendation: 1 complete meal plan");
                System.out.println("  Breakfast: " + String.join(", ", mealPlan.get(0)));
                System.out.println("  Lunch: " + String.join(", ", mealPlan.get(1)));
                System.out@@.println("  Dinner: " + String.join(", ", mealPlan.get(2)));
            }

            if (mealPlan != null && !mealPlan.isEmpty()) {
                return ResponseEntity.ok(mealPlan);
            } else {
                System.out.println("Response to client: No feasible solution");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No feasible meal plan found for the given constraints.");
            }
        } catch (Exception e) {
            System.out.println("Exception occurred while processing request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred while processing request: " + e.getMessage());
        }
    }

    // 餐饮计划请求体类（已改为接收weight, height, age）
    public static class MealPlanRequest {
        private double weight;  // kg
        private double height;  // cm
        private int age;

        // 无参构造器
        public MealPlanRequest() {
        }

        // 带参数构造器
        public MealPlanRequest(double weight, double height, int age) {
            this.weight = weight;
            this.height = height;
            this.age = age;
        }

        public double getWeight() {
            return weight;
        }

        public void setWeight(double weight) {
            this.weight = weight;
        }

        public double getHeight() {
            return height;
        }

        public void setHeight(double height) {
            this.height = height;
        }

        public int getAge() {
            return age;
        }

        public void setAge(int age) {
            this.age = age;
        }
    }

    // Add a simple test endpoint
    @GetMapping("/api/recommend/test")
    public String test() {
        return "API working normally!";
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