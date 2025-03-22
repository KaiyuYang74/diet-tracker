package com.example.diettracker.repository;

import com.example.diettracker.model.WeightRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeightRecordRepository extends JpaRepository<WeightRecord, Long> {
    
    // 查找用户所有体重记录，按日期降序排列
    @Query("SELECT w FROM WeightRecord w WHERE w.user.userID = :userId ORDER BY w.recordDate DESC")
    List<WeightRecord> findByUserIdOrderByDateDesc(@Param("userId") Long userId);
    
    // 查找用户特定日期的体重记录
    @Query("SELECT w FROM WeightRecord w WHERE w.user.userID = :userId AND w.recordDate = :date")
    Optional<WeightRecord> findByUserIdAndDate(@Param("userId") Long userId, @Param("date") Date date);
    
    // 查找用户在指定日期范围内的体重记录
    @Query("SELECT w FROM WeightRecord w WHERE w.user.userID = :userId AND w.recordDate BETWEEN :startDate AND :endDate ORDER BY w.recordDate ASC")
    List<WeightRecord> findByUserIdAndDateRange(
        @Param("userId") Long userId, 
        @Param("startDate") Date startDate,
        @Param("endDate") Date endDate
    );
    
    // 获取用户最近的体重记录
    @Query("SELECT w FROM WeightRecord w WHERE w.user.userID = :userId ORDER BY w.recordDate DESC")
    List<WeightRecord> findRecentByUserId(@Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);
}