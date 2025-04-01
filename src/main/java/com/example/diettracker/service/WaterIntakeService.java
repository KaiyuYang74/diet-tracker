package com.example.diettracker.service;

import com.example.diettracker.model.User;
import com.example.diettracker.model.WaterIntake;
import com.example.diettracker.repository.UserRepository;
import com.example.diettracker.repository.WaterIntakeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;

@Service
public class WaterIntakeService {

    @Autowired
    private WaterIntakeRepository waterIntakeRepository;

    @Autowired
    private UserRepository userRepository;

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    /**
     * Save or update a water intake record
     * @param userID User ID
     * @param amount Water amount in ml
     * @param recordDate Date of the record
     * @return Saved WaterIntake record
     */
    public WaterIntake saveWaterIntake(Long userID, Integer amount, Date recordDate) {
        Optional<User> userOpt = userRepository.findById(userID);
        
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found with ID: " + userID);
        }
        
        // Check if record already exists for this date
        Optional<WaterIntake> existingRecord = waterIntakeRepository.findByUserAndDate(userID, recordDate);
        
        if (existingRecord.isPresent()) {
            // Update existing record
            WaterIntake record = existingRecord.get();
            record.setAmount(amount);
            return waterIntakeRepository.save(record);
        } else {
            // Create new record
            WaterIntake newRecord = new WaterIntake(userOpt.get(), amount, recordDate);
            return waterIntakeRepository.save(newRecord);
        }
    }

    /**
     * Get water intake record for a specific date
     * @param userID User ID
     * @param dateStr Date string in yyyy-MM-dd format
     * @return Optional WaterIntake record
     * @throws ParseException If date format is invalid
     */
    public Optional<WaterIntake> getWaterIntakeByDate(Long userID, String dateStr) throws ParseException {
        Date date = dateFormat.parse(dateStr);
        return waterIntakeRepository.findByUserAndDate(userID, date);
    }

    /**
     * Delete a water intake record
     * @param intakeID Record ID to delete
     */
    public void deleteWaterIntake(Long intakeID) {
        waterIntakeRepository.deleteById(intakeID);
    }
}