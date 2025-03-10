package com.example.diettracker.service;

import com.example.diettracker.model.Goal;
import com.example.diettracker.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    public Goal setUserGoal(Goal goal) {
        goal.setBmr(calculateCalories(goal));
        return goalRepository.save(goal);
    }

    public Optional<Goal> getUserGoal(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public double calculateCalories(Goal user) {
        if (user.getGender().equalsIgnoreCase("male")) {
            return 88.362 + (13.397 * user.getWeight()) + (4.799 * user.getHeight()) - (5.677 * user.getAge());
        } else {
            return 447.593 + (9.247 * user.getWeight()) + (3.098 * user.getHeight()) - (4.330 * user.getAge());
        }
    }
}

