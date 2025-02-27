package com.example.diettracker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

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
    private String goal;
    @Column
    private String preferences;
}

