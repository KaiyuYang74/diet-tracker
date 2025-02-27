package com.example.diettracker.service;

import com.example.diettracker.model.User;
import com.example.diettracker.model.FoodsRec;

import java.util.List;

public interface RecService {
    /**
     * Updates the user's information
     * @param username current user's username
     * @param newUserInfo the new user information
     */
    User updateUserInfo(String username, User newUserInfo);

    /**
     * Calculates the number of calories the user should consume
     * @param username current user's username
     */
    double calculateCalories(String username);

    /**
     * Recommends foods based on the user's preferences
     * @param username current user's username
     */
    List<FoodsRec> recommendFoods(String username);
}
