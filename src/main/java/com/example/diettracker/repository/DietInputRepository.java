// src/main/java/com/example/diettracker/repository/DietInputRepository.java
package com.example.diettracker.repository;

import com.example.diettracker.model.DietDailyInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface DietInputRepository extends JpaRepository<DietDailyInput, Integer> {
    @Query("SELECT d FROM DietDailyInput d WHERE d.user.userID = :userId AND d.date = :date")
    List<DietDailyInput> findByUserIdAndDate(@Param("userId") Long userId, @Param("date") Date date);
}