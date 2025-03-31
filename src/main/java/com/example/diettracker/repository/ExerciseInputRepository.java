package com.example.diettracker.repository;

import com.example.diettracker.model.ExerciseInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ExerciseInputRepository extends JpaRepository<ExerciseInput, Long> {
    // 根据用户ID和日期查询运动记录
    @Query("SELECT e FROM ExerciseInput e WHERE e.user.id = :userId AND e.date = :date")
    List<ExerciseInput> findByUserIdAndDate(
        @Param("userId") Long userId, 
        @Param("date") Date date
    );

    // 根据用户ID和日期及运动类型查询
    @Query("SELECT e FROM ExerciseInput e WHERE e.user.id = :userId AND e.date = :date AND e.exerciseType = :exerciseType")
    List<ExerciseInput> findByUserIdAndDateAndType(
        @Param("userId") Long userId, 
        @Param("date") Date date,
        @Param("exerciseType") String exerciseType
    );
}