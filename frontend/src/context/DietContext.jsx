import { createContext, useState, useContext } from 'react';

// Create context
const DietContext = createContext();

// Create provider component
export function DietProvider({ children }) {
  // Initialize meals state with empty arrays for each meal type
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // Add food to a specific meal
  const addFood = (mealType, food) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: [...(prevMeals[mealType] || []), food]
    }));
  };

  // Remove food from a specific meal
  const removeFood = (mealType, foodId) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].filter(item => item.id !== foodId)
    }));
  };

  // Calculate total nutrition values for a meal
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

  // Calculate totals for all meals
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

// Create custom hook for using the context
export function useDiet() {
  const context = useContext(DietContext);
  if (!context) {
    throw new Error('useDiet must be used within a DietProvider');
  }
  return context;
}