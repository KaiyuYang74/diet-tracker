package com.example.diettracker.service.impl;

import com.example.diettracker.service.RecService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.diettracker.model.User;
import com.example.diettracker.repository.FoodsRepository;
import com.example.diettracker.repository.UserRepository;
import com.example.diettracker.model.Foods;
import com.example.diettracker.model.FoodsRec;
import java.util.*;

@Service
public class RecServiceImpl implements RecService {
    @Autowired
    private FoodsRepository foodsRepository;

    @Autowired
    private UserRepository userRepository;

    public User updateUserInfo(String username, User newUserInfo) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setAge(newUserInfo.getAge());
            user.setGender(newUserInfo.getGender());
            user.setHeight(newUserInfo.getHeight());
            user.setWeight(newUserInfo.getWeight());
            user.setGoal(newUserInfo.getGoal());
            user.setPreferences(newUserInfo.getPreferences());
            return userRepository.save(user);
        }
        return null;
    }

    public double calculateCalories(String username) {
        double bmr;
        User user = userRepository.findByUsername(username).get();
        if (user.getGender().equalsIgnoreCase("male")) {
            bmr = 88.362 + (13.397 * user.getWeight()) + (4.799 * user.getHeight()) - (5.677 * user.getAge());
        } else {
            bmr = 447.593 + (9.247 * user.getWeight()) + (3.098 * user.getHeight()) - (4.330 * user.getAge());
        }
        return user.getGoal().equals("lose_weight") ? bmr * 0.8 : bmr * 1.2;
    }

//    1g   蛋白质=4Kcal   1g碳水=4Kcal   1g脂肪=9Kcal
//    热量比：   5              3             2
    @Transactional(readOnly = true)
    public List<FoodsRec> recommendFoods(String username) {
        double targetCalories = calculateCalories(username);

        double targetProteinCal = 0.5 * targetCalories;
        double targetCarbCal = 0.3 * targetCalories;
        double targetFatCal = 0.2 * targetCalories;

        double ProteinGrams = targetProteinCal / 4;
        double CarbGrams = targetCarbCal / 4;
        double FatGrams = targetFatCal / 9;

        // 手动设置食物数量
        int meatCount = 2;
        int stapleCount = 1;
        int vegetableCount = 2;
        int oilCount = 1;

        // 从数据库获取食物
        List<Foods> meats = foodsRepository.findByCategory("MEAT");
        List<Foods> staples = foodsRepository.findByCategory("STAPLE");
        List<Foods> vegetables = foodsRepository.findByCategory("VEGETABLE");
        List<Foods> oils = foodsRepository.findByCategory("OIL");

        // 基于蛋白质、碳水、脂肪的热量接近目标比例 5:3:2 选择食物
        List<FoodsRec> selectedMeats = selectOptimalFoods(meats, meatCount, ProteinGrams * 0.8, "protein");
        List<FoodsRec> selectedStaples = selectOptimalFoods(staples, stapleCount, CarbGrams * 0.8, "carb");
        List<FoodsRec> selectedOils = selectOptimalFoods(oils, oilCount, FatGrams * 0.8, "fat");

        // 选择蔬菜
        Collections.shuffle(vegetables);
        List<Foods> subVeg = vegetables.subList(0, vegetableCount);
        double vegGrams = 0;
        for (FoodsRec food : selectedMeats) {
            vegGrams += food.getGrams();
        }
        for (FoodsRec food : selectedStaples) {
            vegGrams += food.getGrams();
        }
//        vegGrams *= 2;
        double recVegGrams = vegGrams / vegetableCount;
        List<FoodsRec> selectedVegetables = new ArrayList<>();
        for (Foods food : subVeg) {
            selectedVegetables.add(new FoodsRec(food.getName(), food.getCategory(), recVegGrams));
        }

        // 整合推荐食物
        List<FoodsRec> recommendations = new ArrayList<>();
        recommendations.addAll(selectedMeats);
        recommendations.addAll(selectedStaples);
        recommendations.addAll(selectedOils);
        recommendations.addAll(selectedVegetables);

        return recommendations;
    }

    private List<FoodsRec> selectOptimalFoods(List<Foods> foods, int count, double NutrientGrams, String nutrientType) {
        List<FoodsRec> selectedFoods = new ArrayList<>();

        // 随机选择食物
        Collections.shuffle(foods);
        List<Foods> subFoods = foods.subList(0, count);
        double unitTotal = 0;

        for (Foods food : subFoods) {
            unitTotal += getUnitGramFromNutrient(food, nutrientType);
        }
        double recGrams = NutrientGrams / unitTotal;
        for (Foods food : subFoods) {
            selectedFoods.add(new FoodsRec(food.getName(), food.getCategory(), recGrams));
        }

        return selectedFoods;
    }

    // 每g食物的营养素含量
    private double getUnitGramFromNutrient(Foods foods, String nutrientType) {
        return switch (nutrientType) {
            case "protein" -> foods.getProtein() / 100;
            case "carb" -> foods.getCarbs() / 100;
            case "fat" -> foods.getFat() / 100;
            default -> 0;
        };
    }
}
