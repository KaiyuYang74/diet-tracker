package com.example.diettracker.controller;

import com.example.diettracker.model.WaterIntake;
import com.example.diettracker.service.WaterIntakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/water-intake")
public class WaterIntakeController {

    @Autowired
    private WaterIntakeService waterIntakeService;

    // Add or update water intake record
    @PostMapping
    public ResponseEntity<?> addWaterIntake(@RequestBody Map<String, Object> payload) {
        try {
            Long userID = Long.parseLong(payload.get("userId").toString());
            Integer amount = Integer.parseInt(payload.get("amount").toString());
            
            Date recordDate = new Date(); // Default to current date
            if (payload.containsKey("date")) {
                String dateStr = payload.get("date").toString();
                recordDate = java.sql.Date.valueOf(dateStr);
            }
            
            WaterIntake saved = waterIntakeService.saveWaterIntake(userID, amount, recordDate);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save water intake: " + e.getMessage());
        }
    }

    // Get water intake for a specific date
    @GetMapping
    public ResponseEntity<?> getWaterIntakeByDate(
            @RequestParam Long userId,
            @RequestParam String date) {
        try {
            Optional<WaterIntake> record = waterIntakeService.getWaterIntakeByDate(userId, date);
            return record.isPresent() 
                ? ResponseEntity.ok(record.get()) 
                : ResponseEntity.ok().build();
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch water intake: " + e.getMessage());
        }
    }

    // Delete water intake record
    @DeleteMapping("/{intakeId}")
    public ResponseEntity<?> deleteWaterIntake(@PathVariable Long intakeId) {
        try {
            waterIntakeService.deleteWaterIntake(intakeId);
            return ResponseEntity.ok("Water intake record deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete water intake record: " + e.getMessage());
        }
    }
}