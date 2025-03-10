package com.example.diettracker.controller;

import com.example.diettracker.model.Goal;
import com.example.diettracker.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @PostMapping
    public ResponseEntity<Goal> setGoal(@RequestBody Goal goal) {
        return ResponseEntity.ok(goalService.setUserGoal(goal));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Goal> getGoal(@PathVariable Long userId) {
        Optional<Goal> goal = goalService.getUserGoal(userId);
        return goal.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}

