package com.example.diettracker.controller;

import com.example.diettracker.service.MealPlanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

class MealPlanControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MealPlanService mealPlanService;

    @InjectMocks
    private MealPlanController mealPlanController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(mealPlanController).build();

        // 模拟Service返回的数据
        List<List<String>> mockMealPlan = Arrays.asList(
                Arrays.asList("鸡胸肉", "西兰花", "米饭"),
                Arrays.asList("牛肉", "菠菜", "全麦面包"),
                Arrays.asList("三文鱼", "胡萝卜", "燕麦"));

        when(mealPlanService.mealPlanRecommendation(anyDouble())).thenReturn(mockMealPlan);
    }

    @Test
    void testGetMealPlan() throws Exception {
        // 测试URL参数方式
        mockMvc.perform(get("/api/meal/recommend")
                .param("calorieTarget", "2000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].length()").value(3));
    }

    @Test
    void testNoSolutionFound() throws Exception {
        // 模拟无解情况
        when(mealPlanService.mealPlanRecommendation(5000.0)).thenReturn(null);

        mockMvc.perform(get("/api/meal/recommend")
                .param("calorieTarget", "5000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("无可行解（放宽后也无法满足）"));
    }
}