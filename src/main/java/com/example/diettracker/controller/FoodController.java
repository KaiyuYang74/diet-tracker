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

    // RESTful API 接口 - 根据名称获取食品
    @GetMapping("/name/{name}")
    public List<Food> getFoodsByName(@PathVariable String name) {
        return foodService.getFoodsByName(name);
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