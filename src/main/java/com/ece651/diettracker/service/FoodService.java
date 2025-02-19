package com.ece651.diettracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ece651.diettracker.model.Food;
import com.ece651.diettracker.repository.FoodRepository;

import java.util.List;
import java.util.Optional;

@Service
public class FoodService {
//在创建 FoodService 实例时，需要自动查找并注入类型匹配的 Bean。
//在这里，Spring 将查找一个 FoodRepository 类型的 Bean，并把它注入到 foodRepository 字段中。
    @Autowired
    private FoodRepository foodRepository;

    public List<Food> getAllFoods() {
        return foodRepository.findAll();
    }

    public Optional<Food> getFoodById(Long id) {
        return foodRepository.findById(id);
    }

    public Food saveFood(Food food) {
        return foodRepository.save(food);
    }

    public Food updateFood(Food food) {
        return foodRepository.save(food);
    }

    public void deleteFood(Long id) {
        foodRepository.deleteById(id);
    }
}