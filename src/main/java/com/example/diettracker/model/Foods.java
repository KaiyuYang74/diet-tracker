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

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // 肉类, 主食, 蔬菜, 油类等

    @Column(nullable = false)
    private double protein;

    @Column(nullable = false)
    private double carbs;

    @Column(nullable = false)
    private double fat;
}

