package com.example.diettracker.repository;

import com.example.diettracker.model.WeightInput;
import com.example.diettracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface WeightInputRepository extends JpaRepository<WeightInput, Integer> {
    
    // Find weight inputs by user
    List<WeightInput> findByUser(User user);
    
    // Find weight inputs by user and date
    List<WeightInput> findByUserAndDate(User user, Date date);
    
    // Find weight inputs by user within a date range
    List<WeightInput> findByUserAndDateBetween(User user, Date startDate, Date endDate);
}