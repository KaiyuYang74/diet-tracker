package com.example.diettracker.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.diettracker.model.Food;
import com.example.diettracker.repository.FoodRepository;
import com.example.diettracker.service.FoodService;

@RestController
//给该控制器内的所有接口统一加上前缀。这里把前缀设为 /api/food。
//方法上的 @GetMapping("/all") 则表示最终路径为 GET /api/food/all。
@RequestMapping("/api/food")
public class FoodDbController {

    @Autowired
    private FoodRepository foodRepository;
    
    @Autowired
    private FoodService foodService;

    @GetMapping("/all")
    public List<Food> getAllFoods() {
        System.out.println("DEBUG: /api/food/all endpoint accessed");
        // findAll() 返回的 List<Food> 会被自动转换为 JSON 返回给前端
        return foodRepository.findAll();
    }

    // 添加搜索方法
    @GetMapping("/search")
    public List<Food> searchFoods(@RequestParam String query) {
        System.out.println("DEBUG: Searching foods with query: " + query);
        String lowerCaseQuery = query.toLowerCase();
        return foodRepository.findAll().stream()
                .filter(food -> food.getFood().toLowerCase().contains(lowerCaseQuery))
                .collect(Collectors.toList());
    }
    
    // 添加获取单个食物详情的方法
    @GetMapping("/{id}")
    public Food getFoodById(@PathVariable Long id) {
        System.out.println("DEBUG: Getting food with id: " + id);
        return foodService.getFoodById(id)
                .orElseThrow(() -> new RuntimeException("Food not found with id: " + id));
    }
}
