package com.example.diettracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.diettracker.model.Food;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {
}

