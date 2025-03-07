package com.example.diettracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Recommendation")
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer recomID;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "foodID", nullable = false)
    private Food food;

    @Column(nullable = false)
    private String dietType;

    // Default constructor
    public Recommendation() {
    }

    // Constructor with fields
    public Recommendation(User user, Food food, String dietType) {
        this.user = user;
        this.food = food;
        this.dietType = dietType;
    }

    // Getters and Setters
    public Integer getRecomID() {
        return recomID;
    }

    public void setRecomID(Integer recomID) {
        this.recomID = recomID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Food getFood() {
        return food;
    }

    public void setFood(Food food) {
        this.food = food;
    }

    public String getDietType() {
        return dietType;
    }

    public void setDietType(String dietType) {
        this.dietType = dietType;
    }
}