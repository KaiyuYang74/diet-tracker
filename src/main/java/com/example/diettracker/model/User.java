package com.example.diettracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "User")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userID;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    private Integer age;
    private Integer weight;
    private Integer height;
    private Integer idealWeight;

    // 使用 LocalDate 替代 java.util.Date
    @Column
    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String goalType;

    // 默认构造函数
    public User() {
    }

    // 包含所有字段的构造函数
    public User(String username, String password, String email, Integer age,
                Integer weight, Integer height, Integer idealWeight, String goalType, LocalDate dateOfBirth) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.age = age;
        this.weight = weight;
        this.height = height;
        this.idealWeight = idealWeight;
        this.goalType = goalType;
        this.dateOfBirth = dateOfBirth;
    }

    // Getters and Setters

    public Integer getUserID() {
        return userID;
    }

    public void setUserID(Integer userID) {
        this.userID = userID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getIdealWeight() {
        return idealWeight;
    }

    public void setIdealWeight(Integer idealWeight) {
        this.idealWeight = idealWeight;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGoalType() {
        return goalType;
    }

    public void setGoalType(String goalType) {
        this.goalType = goalType;
    }
}
