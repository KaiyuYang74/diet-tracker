package com.example.diettracker.model;

import jakarta.persistence.*;
import java.util.Date;
import java.sql.Time;

@Entity
@Table(name = "Diet_Daily_Input")
public class DietDailyInput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer dietID;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "foodID", nullable = false)
    private Food food;

    @Column(nullable = false)
    private String dietType;

    @Column(nullable = false)
    private Integer calories;

    @Column(nullable = false)
    private Time time;

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    private Date date;

    // Default constructor
    public DietDailyInput() {
    }

    // Constructor with fields
    public DietDailyInput(User user, Food food, String dietType, Integer calories, 
                          Time time, Date date) {
        this.user = user;
        this.food = food;
        this.dietType = dietType;
        this.calories = calories;
        this.time = time;
        this.date = date;
    }

    // Getters and Setters
    public Integer getDietID() {
        return dietID;
    }

    public void setDietID(Integer dietID) {
        this.dietID = dietID;
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

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public Time getTime() {
        return time;
    }

    public void setTime(Time time) {
        this.time = time;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}