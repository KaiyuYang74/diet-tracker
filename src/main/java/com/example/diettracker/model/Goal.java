package com.example.diettracker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "goal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // 关联用户

    // Information need to be updated
    @Column
    private int age;
    @Column
    private String gender;
    @Column
    private double height;
    @Column
    private double weight;
    @Column
    private double bmr; // 基础代谢率
    @Column
    private double calorieGoal; // 目标卡路里
    @Column
    private String goalType; // "gain_weight" / "lose_weight"
}

