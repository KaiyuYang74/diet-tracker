package com.example.diettracker.model;

import jakarta.persistence.*;
import java.util.Date;
import java.sql.Time;

@Entity
@Table(name = "Exercise_Input")
public class ExerciseInput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exerciseID")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    private User user;

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    private Date date;

    @Column(nullable = false)
    private Time time;

    @Column(nullable = false)
    private Integer calories;

    // Default constructor
    public ExerciseInput() {
    }

    // Constructor with fields
    public ExerciseInput(User user, Date date, Time time, Integer calories) {
        this.user = user;
        this.date = date;
        this.time = time;
        this.calories = calories;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    // public void setId(Integer id) {
    //     this.exerciseId = id;
    // }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Time getTime() {
        return time;
    }

    public void setTime(Time time) {
        this.time = time;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

}