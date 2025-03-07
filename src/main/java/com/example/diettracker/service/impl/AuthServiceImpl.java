package com.example.diettracker.service.impl;

import com.example.diettracker.model.User;
import com.example.diettracker.service.AuthService;
import com.example.diettracker.repository.UserRepository;
import com.example.diettracker.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public String register(User user) { // registration service
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email has been taken";
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "Username already taken!";
        }
        userRepository.save(user);
        return "New user registered successfully!";
    }

    @Override
    // login service
    //User can login in by username or email
    public String login(User loginUser) {
        Optional<User> user = userRepository.findByUsername(loginUser.getUsername())
                .or(() -> userRepository.findByEmail(loginUser.getUsername()));

        if (user.isEmpty() || !user.get().getPassword().equals(loginUser.getPassword())) {
            return "Invalid credentials!";
        }

        return "login successfully!" + JwtUtil.generateToken(loginUser.getUsername()) + "|" + user.get().getUserID();
    }
}
