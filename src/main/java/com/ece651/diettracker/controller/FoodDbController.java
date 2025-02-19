package com.ece651.diettracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ece651.diettracker.model.Food;
import com.ece651.diettracker.repository.FoodRepository;

@RestController
//给该控制器内的所有接口统一加上前缀。这里把前缀设为 /api/food。
//方法上的 @GetMapping("/all") 则表示最终路径为 GET /api/food/all。
@RequestMapping("/api/food")
public class FoodDbController {

    @Autowired
    private FoodRepository foodRepository;

    @GetMapping("/all")
    public List<Food> getAllFoods() {
        System.out.println("DEBUG: /api/food/all endpoint accessed");
        // findAll() 返回的 List<Food> 会被自动转换为 JSON 返回给前端
        return foodRepository.findAll();
    }
}