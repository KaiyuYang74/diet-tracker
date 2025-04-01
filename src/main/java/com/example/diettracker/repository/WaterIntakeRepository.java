package com.example.diettracker.repository;

import com.example.diettracker.model.WaterIntake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface WaterIntakeRepository extends JpaRepository<WaterIntake, Long> {
    
    // Use explicit query to avoid property path issues
    @Query("SELECT w FROM WaterIntake w WHERE w.user.userID = :userID AND w.recordDate = :recordDate")
    Optional<WaterIntake> findByUserAndDate(@Param("userID") Long userID, @Param("recordDate") Date recordDate);
}