package com.example.diettracker.service;

import com.example.diettracker.model.User;

public interface AuthService {
    /**
     * user registration
     */
    String register(User user);

    /**
     * user login
     */
    String login(User user);
}
