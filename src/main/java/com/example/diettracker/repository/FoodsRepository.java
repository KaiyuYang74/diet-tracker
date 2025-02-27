package com.example.diettracker.repository;

import com.example.diettracker.model.Foods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodsRepository extends JpaRepository<Foods, Long> {
    List<Foods> findByCategory(String category);
}
