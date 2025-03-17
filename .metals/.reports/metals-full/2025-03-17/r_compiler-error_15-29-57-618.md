file://<WORKSPACE>/src/main/java/com/example/diettracker/controller/MealPlanController.java
### java.util.NoSuchElementException: next on empty iterator

occurred in the presentation compiler.

presentation compiler configuration:


action parameters:
offset: 465
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
import com.example.diettracker.service.LossWeightDietS@@ervice;
import com.example.diettracker.service.GainWeightDietService;
import com.example.diettracker.service.BuildMuscleService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
public class MealPlanController {

    @Autowired
    private LossWeightDietService lossWeightDietService;

    @Autowired
    private GainWeightDietService gainWeightDietService;

    @Autowired
    private BuildMuscleService buildMuscleService;

    /**
     * 获取餐饮计划（GET方法）
     * 添加目标类型参数
     */
    @GetMapping({ "/api/recommend", "/api/meal/recommend" })
    public ResponseEntity<?> getMealPlan(
            @RequestParam(value = "weight") double weight,
            @RequestParam(value = "height") double height,
            @RequestParam(value = "age") int age,
            @RequestParam(value = "type", defaultValue = "loss") String type) {

        System.out.println("GET Request received: weight=" + weight + ", height=" + height +
                ", age=" + age + ", type=" + type);
        return processMealPlanRequest(weight, height, age, type);
    }

    /**
     * 获取餐饮计划（POST方法）
     * 接收JSON请求体，包含体重/身高/年龄和目标类型
     */
    @PostMapping({ "/api/recommend", "/api/meal/recommend" })
    public ResponseEntity<?> postMealPlan(@RequestBody MealPlanRequest request) {
        System.out.println("POST Request received: weight=" + request.getWeight() +
                ", height=" + request.getHeight() + ", age=" + request.getAge() +
                ", type=" + request.getType());
        return processMealPlanRequest(request.getWeight(), request.getHeight(),
                request.getAge(), request.getType());
    }

    /**
     * 处理餐饮计划请求的通用方法
     */
    private ResponseEntity<?> processMealPlanRequest(double weight, double height, int age, String type) {
        try {
            List<List<String>> mealPlan;

            // 根据类型选择不同的服务
            switch (type.toLowerCase()) {
                case "gain":
                    mealPlan = gainWeightDietService.mealPlanRecommendation(weight, height, age);
                    break;
                case "muscle":
                    mealPlan = buildMuscleService.mealPlanRecommendation(weight, height, age);
                    break;
                case "loss":
                default:
                    mealPlan = lossWeightDietService.mealPlanRecommendation(weight, height, age);
                    break;
            }

            if (mealPlan == null || mealPlan.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("无法为当前输入找到合适的餐饮计划，请调整参数后重试。");
            }

            MealPlanResponse response = new MealPlanResponse();
            response.setBreakfast(mealPlan.get(0));
            response.setLunch(mealPlan.get(1));
            response.setDinner(mealPlan.get(2));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("处理请求时发生错误：" + e.getMessage());
        }
    }

    /**
     * 请求对象封装
     */
    public static class MealPlanRequest {
        private double weight; // kg
        private double height; // cm
        private int age;
        private String type = "loss"; // 默认为减重

        public MealPlanRequest() {
        }

        public MealPlanRequest(double weight, double height, int age, String type) {
            this.weight = weight;
            this.height = height;
            this.age = age;
            this.type = type;
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

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    /**
     * 响应对象封装
     */
    public static class MealPlanResponse {
        private List<String> breakfast;
        private List<String> lunch;
        private List<String> dinner;

        public List<String> getBreakfast() {
            return breakfast;
        }

        public void setBreakfast(List<String> breakfast) {
            this.breakfast = breakfast;
        }

        public List<String> getLunch() {
            return lunch;
        }

        public void setLunch(List<String> lunch) {
            this.lunch = lunch;
        }

        public List<String> getDinner() {
            return dinner;
        }

        public void setDinner(List<String> dinner) {
            this.dinner = dinner;
        }
    }

    @GetMapping("/api/recommend/test")
    public String test() {
        return "MealPlan API is running!";
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