// src/context/DietContext.jsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// 创建上下文
const DietContext = createContext();

// 创建提供者组件
export function DietProvider({ children }) {
  const { currentUser, isAuthenticated } = useAuth();
  
  // 初始化餐次状态
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // 当用户变化时重置状态
  useEffect(() => {
    if (!isAuthenticated) {
      // 用户登出时重置状态
      setMeals({
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      });
    }
  }, [isAuthenticated]);

  // 使用 useCallback 包装 setMeals 确保引用稳定性
  const setMealsStable = useCallback((newMeals) => {
    setMeals(newMeals);
  }, []);

  // 添加食物到指定餐次 - 使用 useCallback 包装
  const addFood = useCallback((mealType, food) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: [...(prevMeals[mealType] || []), food]
    }));
  }, []);

  // 从指定餐次移除食物 - 使用 useCallback 包装
  const removeFood = useCallback((mealType, foodId) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].filter(item => item.id !== foodId)
    }));
  }, []);

  // 计算餐次的营养总量 - 使用 useCallback 包装
  const calculateMealTotals = useCallback((mealType) => {
    if (!meals[mealType] || meals[mealType].length === 0) {
      return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    }
    
    return meals[mealType].reduce((total, food) => {
      return {
        calories: total.calories + (food.calories * food.quantity || 0),
        protein: total.protein + (food.protein * food.quantity || 0),
        fat: total.fat + (food.fat * food.quantity || 0),
        carbs: total.carbs + (food.carbs * food.quantity || 0)
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [meals]);

  // 计算所有餐次的营养总量 - 使用 useCallback 包装
  const calculateDailyTotals = useCallback(() => {
    const mealTypes = Object.keys(meals);
    return mealTypes.reduce((total, type) => {
      const mealTotal = calculateMealTotals(type);
      return {
        calories: total.calories + mealTotal.calories,
        protein: total.protein + mealTotal.protein,
        fat: total.fat + mealTotal.fat,
        carbs: total.carbs + mealTotal.carbs
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [meals, calculateMealTotals]);

  return (
    <DietContext.Provider 
      value={{ 
        meals, 
        setMeals: setMealsStable, // 使用稳定化的函数
        addFood, 
        removeFood, 
        calculateMealTotals,
        calculateDailyTotals,
        currentUserId: currentUser?.id // 暴露当前用户ID
      }}
    >
      {children}
    </DietContext.Provider>
  );
}

// 自定义钩子
export function useDiet() {
  const context = useContext(DietContext);
  if (!context) {
    throw new Error('useDiet must be used within a DietProvider');
  }
  return context;
}