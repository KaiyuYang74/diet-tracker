package com.example.diettracker.service;

import com.example.diettracker.model.User;
import com.example.diettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    // 添加专门用于更新用户目标类型的方法
    public User updateUserGoal(Long userId, String goalType) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setGoalType(goalType);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    // 添加获取用户目标类型的便捷方法
    public String getUserGoalType(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        return userOptional.map(User::getGoalType).orElse(null);
    }
}