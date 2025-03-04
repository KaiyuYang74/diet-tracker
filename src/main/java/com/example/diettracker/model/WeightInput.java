package com.example.diettracker.model;

import jakarta.persistence.*;
import java.util.Date;
import java.sql.Time;

@Entity
@Table(name = "Weight_input")
public class WeightInput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    private String input;  // Using TYPE as field name might conflict with Java keywords

    // Default constructor
    public WeightInput() {
    }

    // Constructor with fields
    public WeightInput(User user, Date date, Time time, String input) {
        this.user = user;
        this.date = date;
        this.time = time;
        this.input = input;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

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

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }
}