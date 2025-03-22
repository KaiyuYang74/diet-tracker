package com.example.diettracker.service;

import com.example.diettracker.model.User;
import com.example.diettracker.model.WeightRecord;
import com.example.diettracker.repository.UserRepository;
import com.example.diettracker.repository.WeightRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class WeightRecordService {

    @Autowired
    private WeightRecordRepository weightRecordRepository;
    
    @Autowired
    private UserRepository userRepository;

    // 添加或更新体重记录
    public WeightRecord saveWeightRecord(Long userId, Double weight, Date recordDate) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        // 检查该日期是否已有记录
        Optional<WeightRecord> existingRecord = weightRecordRepository.findByUserIdAndDate(userId, recordDate);
        
        if (existingRecord.isPresent()) {
            // 更新现有记录
            WeightRecord record = existingRecord.get();
            record.setWeight(weight);
            record.setCreatedAt(new Date());
            return weightRecordRepository.save(record);
        } else {
            // 创建新记录
            WeightRecord newRecord = new WeightRecord(userOpt.get(), weight, recordDate);
            return weightRecordRepository.save(newRecord);
        }
    }

    // 获取用户所有体重记录
    public List<WeightRecord> getAllWeightRecords(Long userId) {
        return weightRecordRepository.findByUserIdOrderByDateDesc(userId);
    }

    // 获取用户特定日期的体重记录
    public Optional<WeightRecord> getWeightRecordByDate(Long userId, String dateStr) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        Date date = format.parse(dateStr);
        return weightRecordRepository.findByUserIdAndDate(userId, date);
    }

    // 获取用户最近30天的体重记录
    public List<WeightRecord> getRecentWeightRecords(Long userId) {
        Calendar calendar = Calendar.getInstance();
        Date endDate = calendar.getTime();
        
        // 30天前
        calendar.add(Calendar.DAY_OF_MONTH, -30);
        Date startDate = calendar.getTime();
        
        return weightRecordRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    // 获取用户最近的n条体重记录
    public List<WeightRecord> getLastNWeightRecords(Long userId, int count) {
        return weightRecordRepository.findRecentByUserId(userId, PageRequest.of(0, count));
    }

    // 删除体重记录
    public void deleteWeightRecord(Long recordId) {
        weightRecordRepository.deleteById(recordId);
    }
}