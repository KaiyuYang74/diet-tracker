package com.example.diettracker.model;

import jakarta.persistence.*;
import java.util.Date;
import java.sql.Time;

@Entity
@Table(name = "exercise_input")
public class ExerciseInput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exercise_input_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String exerciseName;

    @Column(nullable = false)
    private String exerciseType; // cardio 或 strength

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    private Date date;

    @Column(nullable = false)
    private Time time;

    @Column(nullable = false)
    private Integer duration; // 运动时长（分钟）

    @Column(nullable = false)
    private Integer calories; // 消耗卡路里

    // 默认构造函数
    public ExerciseInput() {
    }

    // 带参数的构造函数
    public ExerciseInput(User user, String exerciseName, String exerciseType, 
                         Date date, Time time, Integer duration, Integer calories) {
        this.user = user;
        this.exerciseName = exerciseName;
        this.exerciseType = exerciseType;
        this.date = date;
        this.time = time;
        this.duration = duration;
        this.calories = calories;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public String getExerciseType() {
        return exerciseType;
    }

    public void setExerciseType(String exerciseType) {
        this.exerciseType = exerciseType;
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

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }
}