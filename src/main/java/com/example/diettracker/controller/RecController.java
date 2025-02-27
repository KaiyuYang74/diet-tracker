package com.example.diettracker.controller;

import com.example.diettracker.service.impl.RecServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.diettracker.model.User;
import com.example.diettracker.model.FoodsRec;
import java.util.List;

@RestController
@RequestMapping("/diet")
public class RecController {

    @Autowired
    private RecServiceImpl recService;

    @PutMapping("/{user}/update")
    public User updateUser(@PathVariable("user") String username, @RequestBody User newUserInfo) {
        return recService.updateUserInfo(username, newUserInfo);
    }

    @PostMapping("/{user}/recommend")
    public List<FoodsRec> getRecommendations(@PathVariable("user") String username) {
        return recService.recommendFoods(username);
    }
}
