package com.example.diettracker.controller;

import com.example.diettracker.model.WeightInput;
import com.example.diettracker.model.User;
import com.example.diettracker.service.WeightInputService;
import com.example.diettracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/weight")
public class WeightInputController {

    @Autowired
    private WeightInputService weightInputService;
    
    @Autowired
    private UserService userService;
    
    // Get all weight inputs for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WeightInput>> getWeightInputsByUser(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
            List<WeightInput> weightInputs = weightInputService.getAllWeightInputsByUser(user.get());
            return new ResponseEntity<>(weightInputs, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Get weight inputs for a user on a specific date
    @GetMapping("/user/{userId}/date/{date}")
    public ResponseEntity<List<WeightInput>> getWeightInputsByUserAndDate(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
            List<WeightInput> weightInputs = weightInputService.getWeightInputsByUserAndDate(user.get(), date);
            return new ResponseEntity<>(weightInputs, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Create a new weight input
    @PostMapping("/")
    public ResponseEntity<WeightInput> createWeightInput(@RequestBody WeightInput weightInput) {
        WeightInput savedInput = weightInputService.saveWeightInput(weightInput);
        return new ResponseEntity<>(savedInput, HttpStatus.CREATED);
    }
    
    // Get a weight input by ID
    @GetMapping("/{id}")
    public ResponseEntity<WeightInput> getWeightInputById(@PathVariable Integer id) {
        Optional<WeightInput> weightInput = weightInputService.getWeightInputById(id);
        return weightInput.map(input -> new ResponseEntity<>(input, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // Update an existing weight input
    @PutMapping("/{id}")
    public ResponseEntity<WeightInput> updateWeightInput(
            @PathVariable Integer id, @RequestBody WeightInput weightInputDetails) {
        
        Optional<WeightInput> optionalWeightInput = weightInputService.getWeightInputById(id);
        if (optionalWeightInput.isPresent()) {
            WeightInput existingWeightInput = optionalWeightInput.get();
            existingWeightInput.setDate(weightInputDetails.getDate());
            existingWeightInput.setTime(weightInputDetails.getTime());
            existingWeightInput.setInput(weightInputDetails.getInput());
            // Don't update the user
            
            WeightInput updatedWeightInput = weightInputService.saveWeightInput(existingWeightInput);
            return new ResponseEntity<>(updatedWeightInput, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete a weight input
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWeightInput(@PathVariable Integer id) {
        Optional<WeightInput> weightInput = weightInputService.getWeightInputById(id);
        if (weightInput.isPresent()) {
            weightInputService.deleteWeightInput(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Get weight inputs for a user within a date range
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<WeightInput>> getWeightInputsByUserAndDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
            List<WeightInput> weightInputs = weightInputService.getWeightInputsByUserAndDateRange(
                    user.get(), startDate, endDate);
            return new ResponseEntity<>(weightInputs, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}