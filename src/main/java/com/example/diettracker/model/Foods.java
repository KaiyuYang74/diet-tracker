package com.example.diettracker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "foods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Foods {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category; // 肉类, 主食, 蔬菜, 油类等
    private double protein;
    private double carbs;
    private double fat;
    private double calories; // 每 100g 的热量
}

