package com.example.diettracker.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "water_intake", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userID", "record_date"})
})
public class WaterIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long intakeID;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    private User user;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "record_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date recordDate;

    // Default constructor
    public WaterIntake() {
    }

    // Constructor with fields
    public WaterIntake(User user, Integer amount, Date recordDate) {
        this.user = user;
        this.amount = amount;
        this.recordDate = recordDate;
    }

    // Getters and Setters
    public Long getIntakeID() {
        return intakeID;
    }

    public void setIntakeID(Long intakeID) {
        this.intakeID = intakeID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public Date getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(Date recordDate) {
        this.recordDate = recordDate;
    }
}