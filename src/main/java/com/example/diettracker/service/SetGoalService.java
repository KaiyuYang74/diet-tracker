package com.example.diettracker.service;

import com.example.diettracker.model.SetGoal;
import com.example.diettracker.repository.SetGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SetGoalService {

    private final SetGoalRepository setGoalRepository;

    @Autowired
    public SetGoalService(SetGoalRepository setGoalRepository) {
        this.setGoalRepository = setGoalRepository;
    }

    public List<SetGoal> getAllGoals() {
        return setGoalRepository.findAll();
    }

    public Optional<SetGoal> getGoalById(Integer id) {
        return setGoalRepository.findById(id);
    }

    public List<SetGoal> getGoalsByUserId(Integer userId) {
        return setGoalRepository.findByUser_UserID(userId);
    }

    public SetGoal createGoal(SetGoal setGoal) {
        return setGoalRepository.save(setGoal);
    }

    public SetGoal updateGoal(SetGoal setGoal) {
        return setGoalRepository.save(setGoal);
    }

    public void deleteGoal(Integer id) {
        setGoalRepository.deleteById(id);
    }
}