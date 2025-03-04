package com.example.diettracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "SetGoal")
public class SetGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer goalID;

    @Column(nullable = false)
    private String goalType;

    private Integer formulaID;

    @ManyToOne
    @JoinColumn(name = "goalID", insertable = false, updatable = false)
    private User user;

    // Default constructor
    public SetGoal() {
    }

    // Constructor with fields
    public SetGoal(String goalType, Integer formulaID) {
        this.goalType = goalType;
        this.formulaID = formulaID;
    }

    // Getters and Setters
    public Integer getGoalID() {
        return goalID;
    }

    public void setGoalID(Integer goalID) {
        this.goalID = goalID;
    }

    public String getGoalType() {
        return goalType;
    }

    public void setGoalType(String goalType) {
        this.goalType = goalType;
    }

    public Integer getFormulaID() {
        return formulaID;
    }

    public void setFormulaID(Integer formulaID) {
        this.formulaID = formulaID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}