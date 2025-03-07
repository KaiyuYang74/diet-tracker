// src/main/java/com/example/diettracker/service/DietInputService.java
package com.example.diettracker.service;

import com.example.diettracker.model.DietDailyInput;
import com.example.diettracker.model.Food;
import com.example.diettracker.model.User;
import com.example.diettracker.repository.DietInputRepository;
import com.example.diettracker.repository.FoodRepository;
import com.example.diettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DietInputService {

    @Autowired
    private DietInputRepository dietInputRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FoodRepository foodRepository;

    public DietDailyInput saveDietInput(DietDailyInput dietInput) {
        return dietInputRepository.save(dietInput);
    }
    
    // 修改参数类型为 Long
    public DietDailyInput createDietEntry(Long userId, Long foodId, String dietType, 
                                          Integer calories, Date date, java.sql.Time time) {
        // 获取User和Food实体
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Food> foodOpt = foodRepository.findById(foodId);
        
        if (userOpt.isPresent() && foodOpt.isPresent()) {
            DietDailyInput entry = new DietDailyInput();
            entry.setUser(userOpt.get());
            entry.setFood(foodOpt.get());
            entry.setDietType(dietType);
            entry.setCalories(calories);
            entry.setDate(date);
            entry.setTime(time);
            
            return dietInputRepository.save(entry);
        }
        
        throw new RuntimeException("User or Food not found");
    }

    public List<DietDailyInput> getUserDietByDate(Long userId, String dateStr) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        Date date = format.parse(dateStr);
        return dietInputRepository.findByUserIdAndDate(userId, date);
    }

    public void deleteDietInput(Integer dietId) {
        dietInputRepository.deleteById(dietId);
    }
}