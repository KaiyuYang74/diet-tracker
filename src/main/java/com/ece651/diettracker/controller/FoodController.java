package com.ece651.diettracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.ece651.diettracker.model.Food;
import com.ece651.diettracker.repository.FoodRepository;
import com.ece651.diettracker.service.FoodService;

import java.util.Optional;

@Controller
@RequestMapping("/foods")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @Autowired
    private FoodRepository foodRepository;

    // 显示所有食品列表
    @GetMapping
    public String listFoods(Model model) {
        model.addAttribute("foods", foodService.getAllFoods());
        return "foods";
    }

    // 显示新增食品的表单
    @GetMapping("/new")
    public String showNewFoodForm(Model model) {
        model.addAttribute("food", new Food());
        return "food_form";
    }

    // 保存新增的食品
    @PostMapping
    public String saveFood(@ModelAttribute Food food) {
        foodService.saveFood(food);
        return "redirect:/foods";
    }

    // 显示编辑食品的表单
    @GetMapping("/edit/{id}")
    public String showEditFoodForm(@PathVariable Long id, Model model) {
        Optional<Food> foodOpt = foodService.getFoodById(id);
        if (foodOpt.isPresent()) {
            model.addAttribute("food", foodOpt.get());
            return "food_form";
        } else {
            return "redirect:/foods";
        }
    }

    // 更新食品的信息
    @PostMapping("/update")
    public String updateFood(@ModelAttribute Food food) {
        foodService.updateFood(food);
        return "redirect:/foods";
    }

    // 删除食品
    @GetMapping("/delete/{id}")
    public String deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        return "redirect:/foods";
    }
}