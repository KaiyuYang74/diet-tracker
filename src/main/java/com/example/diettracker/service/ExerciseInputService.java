package com.example.diettracker.service;

import com.example.diettracker.model.ExerciseInput;
import com.example.diettracker.model.User;
import com.example.diettracker.repository.ExerciseInputRepository;
import com.example.diettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ExerciseInputService {

    @Autowired
    private ExerciseInputRepository exerciseInputRepository;
    
    @Autowired
    private UserRepository userRepository;

    // 创建运动记录
    public ExerciseInput createExerciseEntry(Long userId, String exerciseName, 
                                             String exerciseType, Integer calories, 
                                             Integer duration, Date date, Time time) {
        // 获取User实体
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            ExerciseInput entry = new ExerciseInput();
            entry.setUser(userOpt.get());
            entry.setExerciseName(exerciseName);
            entry.setExerciseType(exerciseType);
            entry.setCalories(calories);
            entry.setDuration(duration);
            entry.setDate(date);
            entry.setTime(time);
            
            return exerciseInputRepository.save(entry);
        }
        
        throw new RuntimeException("User not found");
    }

    // 获取特定日期的运动记录
    public List<ExerciseInput> getUserExerciseByDate(Long userId, String dateStr) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        Date date = format.parse(dateStr);
        return exerciseInputRepository.findByUserIdAndDate(userId, date);
    }

    // 删除运动记录
    public void deleteExerciseInput(Long exerciseId) {
        System.out.println("Attempting to delete exercise input with ID: " + exerciseId);
        exerciseInputRepository.deleteById(exerciseId);
        System.out.println("Exercise input deleted successfully");
    }
}