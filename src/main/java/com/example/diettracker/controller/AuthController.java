package com.example.diettracker.controller;

import com.example.diettracker.model.User;
import com.example.diettracker.service.impl.AuthServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthServiceImpl authServiceImpl;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return authServiceImpl.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User loginUser) {
        return authServiceImpl.login(loginUser);
    }

    // @GetMapping("/test") // only for postman testing
    // public String test() {
    // return "Test!";
    // }
}
