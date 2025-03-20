// src/main/java/com/example/diettracker/controller/DietInputController.java
package com.example.diettracker.controller;

import com.example.diettracker.model.DietDailyInput;
import com.example.diettracker.service.DietInputService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Time;
import java.text.ParseException;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diet/input")
public class DietInputController {

    @Autowired
    private DietInputService dietInputService;

    // src/main/java/com/example/diettracker/controller/DietInputController.java
    @PostMapping
    public ResponseEntity<?> addDietInput(@RequestBody Map<String, Object> payload) {
        try {
            // 从请求体中提取数据并确保类型正确
            Long userId = Long.parseLong(payload.get("userId").toString());
            Long foodId = Long.parseLong(payload.get("foodId").toString());
            String dietType = payload.get("dietType").toString();
            Integer calories = Integer.parseInt(payload.get("calories").toString());
            
            // 处理日期和时间
            Date date = new Date(); // 默认当前日期
            Time time = new Time(System.currentTimeMillis()); // 默认当前时间
            
            if (payload.containsKey("date")) {
                String dateStr = payload.get("date").toString();
                // 直接解析为LocalDate，不涉及时区问题
                LocalDate localDate = LocalDate.parse(dateStr);
                // 需要时再转换为java.sql.Date
                date = java.sql.Date.valueOf(localDate);
            }
            
            if (payload.containsKey("time")) {
                String timeStr = payload.get("time").toString();
                time = Time.valueOf(timeStr);
            }
            
            // 创建记录
            DietDailyInput saved = dietInputService.createDietEntry(userId, foodId, dietType, calories, date, time);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save diet input: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserDietByDate(
            @RequestParam Long userId,
            @RequestParam String date) {
        try {
            List<DietDailyInput> dietInputs = dietInputService.getUserDietByDate(userId, date);
            return ResponseEntity.ok(dietInputs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch diet inputs: " + e.getMessage());
        }
    }

    @DeleteMapping("/{dietId}")
    public ResponseEntity<?> deleteDietInput(@PathVariable Integer dietId) {
        try {
            dietInputService.deleteDietInput(dietId);
            return ResponseEntity.ok("Diet input deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete diet input: " + e.getMessage());
        }
    }
}