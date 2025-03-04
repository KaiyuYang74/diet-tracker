package com.example.diettracker.model;

import jakarta.persistence.*;

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

    // Default constructor
    public User() {
    }

    // Constructor with fields
    public User(String username, String password, String email, Integer age, 
                Integer weight, Integer height, Integer idealWeight) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.age = age;
        this.weight = weight;
        this.height = height;
        this.idealWeight = idealWeight;
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
}