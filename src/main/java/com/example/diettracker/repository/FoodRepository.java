package com.example.diettracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.diettracker.model.Food;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {
    List<Food> findByCaloricValueLessThanEqual(double calories);
    List<Food> findByProteinGreaterThanEqual(double protein);
    List<Food> findByCarbohydratesGreaterThanEqual(double carbohydrates);
    // List<Food> findByCategory(String category);
}

