package com.example.diettracker.controller;

import com.example.diettracker.model.SetGoal;
import com.example.diettracker.service.SetGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
public class SetGoalController {

    private final SetGoalService setGoalService;

    @Autowired
    public SetGoalController(SetGoalService setGoalService) {
        this.setGoalService = setGoalService;
    }

    @GetMapping
    public ResponseEntity<List<SetGoal>> getAllGoals() {
        List<SetGoal> goals = setGoalService.getAllGoals();
        return new ResponseEntity<>(goals, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SetGoal> getGoalById(@PathVariable Integer id) {
        Optional<SetGoal> goal = setGoalService.getGoalById(id);
        return goal.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SetGoal>> getGoalsByUserId(@PathVariable Integer userId) {
        List<SetGoal> goals = setGoalService.getGoalsByUserId(userId);
        if (goals.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(goals, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<SetGoal> createGoal(@RequestBody SetGoal setGoal) {
        SetGoal createdGoal = setGoalService.createGoal(setGoal);
        return new ResponseEntity<>(createdGoal, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SetGoal> updateGoal(@PathVariable Integer id, @RequestBody SetGoal setGoal) {
        Optional<SetGoal> existingGoal = setGoalService.getGoalById(id);
        if (existingGoal.isPresent()) {
            setGoal.setGoalID(id);
            SetGoal updatedGoal = setGoalService.updateGoal(setGoal);
            return new ResponseEntity<>(updatedGoal, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Integer id) {
        Optional<SetGoal> existingGoal = setGoalService.getGoalById(id);
        if (existingGoal.isPresent()) {
            setGoalService.deleteGoal(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}