file://<WORKSPACE>/src/main/java/com/example/diettracker/controller/FoodController.java
### java.util.NoSuchElementException: next on empty iterator

occurred in the presentation compiler.

presentation compiler configuration:


action parameters:
uri: file://<WORKSPACE>/src/main/java/com/example/diettracker/controller/FoodController.java
text:
```scala
package com.example.diettracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.diettracker.model.Food;
import com.example.diettracker.repository.FoodRepository;
import com.example.diettracker.service.FoodService;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @Autowired
    private FoodRepository foodRepository;

    // RESTful API 接口 - 获取所有食品
    @GetMapping("/all")
    public List<Food> getAllFoodsApi() {
        System.out.println("DEBUG: /api/foods/all endpoint accessed");
        return foodRepository.findAll();
    }

    // RESTful API 接口 - 根据ID获取食品
    @GetMapping("/{id}")
    public Food getFoodById(@PathVariable Long id) {
        return foodService.getFoodById(id)
                .orElseThrow(() -> new RuntimeException("Food not found with id " + id));
    }

    // RESTful API 接口 - 创建食品
    @PostMapping
    public Food createFood(@RequestBody Food food) {
        return foodService.saveFood(food);
    }

    // RESTful API 接口 - 更新食品
    @PutMapping("/{id}")
    public Food updateFood(@PathVariable Long id, @RequestBody Food foodDetails) {
        Food food = foodService.getFoodById(id)
                .orElseThrow(() -> new RuntimeException("Food not found with id " + id));

        food.setFood(foodDetails.getFood());
        food.setCaloricValue(foodDetails.getCaloricValue());
        food.setProtein(foodDetails.getProtein());
        food.setCarbohydrates(foodDetails.getCarbohydrates());
        food.setFat(foodDetails.getFat());

        return foodService.updateFood(food);
    }

    // RESTful API 接口 - 删除食品
    @DeleteMapping("/{id}")
    public void deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
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
	dotty.tools.pc.WithCompilationUnit.<init>(WithCompilationUnit.scala:31)
	dotty.tools.pc.SimpleCollector.<init>(PcCollector.scala:345)
	dotty.tools.pc.PcSemanticTokensProvider$Collector$.<init>(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.Collector$lzyINIT1(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.Collector(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.provide(PcSemanticTokensProvider.scala:88)
	dotty.tools.pc.ScalaPresentationCompiler.semanticTokens$$anonfun$1(ScalaPresentationCompiler.scala:109)
```
#### Short summary: 

java.util.NoSuchElementException: next on empty iterator