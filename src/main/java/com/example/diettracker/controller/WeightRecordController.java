package com.example.diettracker.controller;

import com.example.diettracker.model.WeightRecord;
import com.example.diettracker.service.WeightRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/weight")
public class WeightRecordController {

    @Autowired
    private WeightRecordService weightRecordService;

    // 添加或更新体重记录
    @PostMapping
    public ResponseEntity<?> addWeightRecord(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            Double weight = Double.parseDouble(payload.get("weight").toString());
            
            Date recordDate = new Date(); // 默认为当前日期
            if (payload.containsKey("date")) {
                String dateStr = payload.get("date").toString();
                recordDate = java.sql.Date.valueOf(dateStr);
            }
            
            WeightRecord saved = weightRecordService.saveWeightRecord(userId, weight, recordDate);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save weight record: " + e.getMessage());
        }
    }

    // 获取用户所有体重记录
    @GetMapping("/all")
    public ResponseEntity<?> getAllWeightRecords(@RequestParam Long userId) {
        try {
            List<WeightRecord> records = weightRecordService.getAllWeightRecords(userId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch weight records: " + e.getMessage());
        }
    }

    // 获取特定日期的体重记录
    @GetMapping("/date")
    public ResponseEntity<?> getWeightRecordByDate(
            @RequestParam Long userId,
            @RequestParam String date) {
        try {
            Optional<WeightRecord> record = weightRecordService.getWeightRecordByDate(userId, date);
            return record.isPresent() 
                ? ResponseEntity.ok(record.get()) 
                : ResponseEntity.ok().build();
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch weight record: " + e.getMessage());
        }
    }

    // 获取最近30天的体重记录
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentWeightRecords(@RequestParam Long userId) {
        try {
            List<WeightRecord> records = weightRecordService.getRecentWeightRecords(userId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch recent records: " + e.getMessage());
        }
    }

    // 获取最近n条记录
    @GetMapping("/last")
    public ResponseEntity<?> getLastNWeightRecords(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "5") int count) {
        try {
            List<WeightRecord> records = weightRecordService.getLastNWeightRecords(userId, count);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch last records: " + e.getMessage());
        }
    }

    // 删除体重记录
    @DeleteMapping("/{recordId}")
    public ResponseEntity<?> deleteWeightRecord(@PathVariable Long recordId) {
        try {
            weightRecordService.deleteWeightRecord(recordId);
            return ResponseEntity.ok("Weight record deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete weight record: " + e.getMessage());
        }
    }
}