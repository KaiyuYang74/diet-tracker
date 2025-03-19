package com.example.diettracker.repository;

import com.example.diettracker.model.SetGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SetGoalRepository extends JpaRepository<SetGoal, Integer> {
    List<SetGoal> findByUser_UserID(Integer userID);
}