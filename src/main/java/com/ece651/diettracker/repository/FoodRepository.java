package com.ece651.diettracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ece651.diettracker.model.Food;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {
}

