import { createContext, useState, useContext, useEffect } from 'react';

// 创建上下文
const DietContext = createContext();

// 创建提供者组件
export function DietProvider({ children }) {
  // 初始化餐次状态
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // 添加食物到指定餐次
  const addFood = (mealType, food) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: [...(prevMeals[mealType] || []), food]
    }));
  };

  // 从指定餐次移除食物
  const removeFood = (mealType, foodId) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].filter(item => item.id !== foodId)
    }));
  };

  // 计算餐次的营养总量
  const calculateMealTotals = (mealType) => {
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
  };

  // 计算所有餐次的营养总量
  const calculateDailyTotals = () => {
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
  };

  return (
    <DietContext.Provider 
      value={{ 
        meals, 
        setMeals,
        addFood, 
        removeFood, 
        calculateMealTotals,
        calculateDailyTotals
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