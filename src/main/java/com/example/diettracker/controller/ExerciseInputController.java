package com.example.diettracker.controller;

import com.example.diettracker.model.ExerciseInput;
import com.example.diettracker.service.ExerciseInputService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Time;
import java.text.ParseException;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercise/input")
public class ExerciseInputController {

    @Autowired
    private ExerciseInputService exerciseInputService;

    @PostMapping
    public ResponseEntity<?> addExerciseInput(@RequestBody Map<String, Object> payload) {
        try {
            // 从请求体中提取数据并确保类型正确
            Long userId = Long.parseLong(payload.get("userId").toString());
            String exerciseName = payload.get("exerciseName").toString();
            String exerciseType = payload.get("exerciseType").toString();
            Integer calories = Integer.parseInt(payload.get("calories").toString());
            Integer duration = Integer.parseInt(payload.get("duration").toString());
            
            // 处理日期和时间
            Date date = new Date(); // 默认当前日期
            Time time = Time.valueOf(LocalTime.now()); // 默认当前时间
            
            if (payload.containsKey("date")) {
                String dateStr = payload.get("date").toString();
                // 直接解析为java.util.Date
                date = java.sql.Date.valueOf(dateStr);
            }
            
            if (payload.containsKey("time")) {
                String timeStr = payload.get("time").toString();
                time = Time.valueOf(timeStr);
            }
            
            // 创建记录
            ExerciseInput saved = exerciseInputService.createExerciseEntry(
                userId, exerciseName, exerciseType, calories, duration, date, time
            );
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save exercise input: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserExerciseByDate(
            @RequestParam Long userId,
            @RequestParam String date) {
        try {
            List<ExerciseInput> exerciseInputs = exerciseInputService.getUserExerciseByDate(userId, date);
            return ResponseEntity.ok(exerciseInputs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch exercise inputs: " + e.getMessage());
        }
    }

    @DeleteMapping("/{exerciseId}")
    public ResponseEntity<?> deleteExerciseInput(@PathVariable Long exerciseId) {
        try {
            exerciseInputService.deleteExerciseInput(exerciseId);
            return ResponseEntity.ok("Exercise input deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete exercise input: " + e.getMessage());
        }
    }
}