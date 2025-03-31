package com.example.diettracker.service;

import com.example.diettracker.model.WeightInput;
import com.example.diettracker.model.User;
import com.example.diettracker.repository.WeightInputRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class WeightInputService {

    @Autowired
    private WeightInputRepository weightInputRepository;
    
    public List<WeightInput> getAllWeightInputsByUser(User user) {
        return weightInputRepository.findByUser(user);
    }
    
    public List<WeightInput> getWeightInputsByUserAndDate(User user, Date date) {
        return weightInputRepository.findByUserAndDate(user, date);
    }
    
    public List<WeightInput> getWeightInputsByUserAndDateRange(User user, Date startDate, Date endDate) {
        return weightInputRepository.findByUserAndDateBetween(user, startDate, endDate);
    }
    
    public WeightInput saveWeightInput(WeightInput weightInput) {
        return weightInputRepository.save(weightInput);
    }
    
    public Optional<WeightInput> getWeightInputById(Integer id) {
        return weightInputRepository.findById(id);
    }
    
    public void deleteWeightInput(Integer id) {
        weightInputRepository.deleteById(id);
    }
}