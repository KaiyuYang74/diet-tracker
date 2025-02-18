import { useState, useEffect } from "react";
import { Edit2, Lock } from 'lucide-react';
import BaseLayout from "../layouts/BaseLayout";
import "../styles/theme.css";
import "../styles/pages/Goals.css";

// 基础常量
const BASE_CALORIES = 2000; // 基础卡路里目标
const PROTEIN_CALORIES_PER_GRAM = 4;
const CARBS_CALORIES_PER_GRAM = 4;
const FAT_CALORIES_PER_GRAM = 9;

// 初始百分比设置
const initialDistribution = {
  macronutrients: {
    carbs: 50,    // 碳水百分比
    protein: 20,  // 蛋白质百分比
    fat: 30,      // 脂肪百分比
  },
  meals: {
    breakfast: 30,
    lunch: 35,
    dinner: 25,
    snacks: 10,
  }
};

// PercentageInput 组件 - 用于编辑百分比
const PercentageInput = ({ label, value, onChange, disabled = false }) => (
  <div className="percentage-input">
    <span className="input-label">{label}</span>
    <div className="input-group">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        min="0"
        max="100"
        step="1"
      />
      <span className="input-suffix">%</span>
    </div>
  </div>
);

// MacronutrientEditor 组件 - 编辑宏量营养素分配
const MacronutrientEditor = ({ distribution, onUpdate }) => {
  const { carbs, protein, fat } = distribution.macronutrients;
  
  return (
    <div className="editor-panel">
      <h4>Macronutrient Distribution</h4>
      <div className="editor-grid">
        <PercentageInput
          label="Carbs"
          value={carbs}
          onChange={(value) => onUpdate('macronutrients', 'carbs', value)}
        />
        <PercentageInput
          label="Protein"
          value={protein}
          onChange={(value) => onUpdate('macronutrients', 'protein', value)}
        />
        <PercentageInput
          label="Fat"
          value={fat}
          onChange={(value) => onUpdate('macronutrients', 'fat', value)}
        />
      </div>
      <div className="total-percentage">
        Total: {carbs + protein + fat}%
        {carbs + protein + fat !== 100 && 
          <span className="warning">Should equal 100%</span>
        }
      </div>
    </div>
  );
};

// MealDistributionEditor 组件 - 编辑餐次分配
const MealDistributionEditor = ({ distribution, onUpdate }) => {
  return (
    <div className="editor-panel">
      <h4>Meal Distribution</h4>
      <div className="editor-grid">
        {Object.entries(distribution.meals).map(([meal, percentage]) => (
          <PercentageInput
            key={meal}
            label={meal.charAt(0).toUpperCase() + meal.slice(1)}
            value={percentage}
            onChange={(value) => onUpdate('meals', meal, value)}
          />
        ))}
      </div>
      <div className="total-percentage">
        Total: {Object.values(distribution.meals).reduce((sum, val) => sum + val, 0)}%
        {Object.values(distribution.meals).reduce((sum, val) => sum + val, 0) !== 100 && 
          <span className="warning">Should equal 100%</span>
        }
      </div>
    </div>
  );
};

function Goals() {
  // 编辑状态
  const [editingCard, setEditingCard] = useState(null);
  
  // 营养分配百分比状态
  const [distribution, setDistribution] = useState(initialDistribution);

  // 计算每日营养目标
  const calculateNutritionGoals = () => {
    const { carbs, protein, fat } = distribution.macronutrients;
    
    // 计算每个营养素的卡路里
    const carbsCalories = (BASE_CALORIES * carbs) / 100;
    const proteinCalories = (BASE_CALORIES * protein) / 100;
    const fatCalories = (BASE_CALORIES * fat) / 100;
    
    // 转换为克数
    return {
      calories: BASE_CALORIES,
      carbs: {
        amount: Math.round(carbsCalories / CARBS_CALORIES_PER_GRAM),
        percentage: carbs
      },
      protein: {
        amount: Math.round(proteinCalories / PROTEIN_CALORIES_PER_GRAM),
        percentage: protein
      },
      fat: {
        amount: Math.round(fatCalories / FAT_CALORIES_PER_GRAM),
        percentage: fat
      }
    };
  };

  // 计算餐次分配
  const calculateMealDistribution = () => {
    const meals = {};
    Object.entries(distribution.meals).forEach(([meal, percentage]) => {
      meals[meal] = {
        percentage,
        calories: Math.round((BASE_CALORIES * percentage) / 100),
        enabled: true // 可以根据需要设置为false
      };
    });
    return meals;
  };

  // 使用计算值
  const nutritionGoals = calculateNutritionGoals();
  const mealDistribution = calculateMealDistribution();

  // 处理编辑按钮点击
  const handleEdit = (cardName) => {
    setEditingCard(editingCard === cardName ? null : cardName);
  };

  // 更新分配百分比
  const updateDistribution = (type, key, value) => {
    setDistribution(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value
      }
    }));
  };

  // 验证百分比总和是否为100%
  useEffect(() => {
    const macroSum = Object.values(distribution.macronutrients).reduce((a, b) => a + b, 0);
    const mealsSum = Object.values(distribution.meals).reduce((a, b) => a + b, 0);
    
    if (macroSum !== 100 || mealsSum !== 100) {
      console.warn('Distribution percentages do not sum to 100%');
    }
  }, [distribution]);

  // 微量营养素计算基于基础卡路里
  const [micronutrients, setMicronutrients] = useState({
    saturatedFat: { amount: Math.round(BASE_CALORIES * 0.1 / FAT_CALORIES_PER_GRAM), unit: 'g', enabled: true },
    polyunsaturatedFat: { amount: Math.round(BASE_CALORIES * 0.07 / FAT_CALORIES_PER_GRAM), unit: 'g', enabled: true },
    monounsaturatedFat: { amount: Math.round(BASE_CALORIES * 0.13 / FAT_CALORIES_PER_GRAM), unit: 'g', enabled: true },
    transFat: { amount: 0, unit: 'g', enabled: true },
    cholesterol: { amount: 300, unit: 'mg', enabled: true },
    sodium: { amount: 2300, unit: 'mg', enabled: true },
    potassium: { amount: 3500, unit: 'mg', enabled: true },
    fiber: { amount: Math.round(BASE_CALORIES / 1000 * 14), unit: 'g', enabled: true },
    sugar: { amount: Math.round(BASE_CALORIES * 0.1 / CARBS_CALORIES_PER_GRAM), unit: 'g', enabled: true }
  });

  // 维生素状态保持不变
  const [vitamins, setVitamins] = useState({
    vitaminA: { amount: 900, unit: 'mcg', percentage: 100, enabled: true },
    vitaminC: { amount: 90, unit: 'mg', percentage: 100, enabled: true },
    calcium: { amount: 1000, unit: 'mg', percentage: 100, enabled: true },
    iron: { amount: 18, unit: 'mg', percentage: 100, enabled: true }
  });

  return (
    <BaseLayout>
      <div className="page-container">
        <div className="grid-layout">
          {/* 每日营养目标卡片 */}
          <div className="card nutrition-card">
            <div className="card-header">
              <h3>Daily Nutrition Goals</h3>
              <button 
                className={`btn-icon ${editingCard === 'nutrition' ? 'active' : ''}`}
                onClick={() => handleEdit('nutrition')}
              >
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
            </div>
            <div className="nutrition-grid">
              <div className="nutrition-item highlight">
                <div className="item-header">
                  <span>Base Calories Goal</span>
                  <span>{BASE_CALORIES} kcal</span>
                </div>
              </div>
              {editingCard === 'nutrition' && (
                <MacronutrientEditor 
                  distribution={distribution}
                  onUpdate={updateDistribution}
                />
              )}
              {Object.entries(nutritionGoals).map(([nutrient, data]) => (
                nutrient !== 'calories' && (
                  <div key={nutrient} className="nutrition-item">
                    <div className="item-header">
                      <span>{nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}</span>
                      <span>{data.amount}g</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{width: `${data.percentage}%`}}
                      />
                      <span className="progress-text">{data.percentage}%</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* 餐次分配卡片 */}
          <div className="card meal-card">
            <div className="card-header">
              <h3>Meal Distribution</h3>
              <button 
                className={`btn-icon ${editingCard === 'meals' ? 'active' : ''}`}
                onClick={() => handleEdit('meals')}
              >
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
            </div>
            {editingCard === 'meals' && (
              <MealDistributionEditor 
                distribution={distribution}
                onUpdate={updateDistribution}
              />
            )}
            <div className="meals-grid">
              {Object.entries(mealDistribution).map(([meal, data]) => (
                <div key={meal} className="meal-item">
                  <div className="meal-info">
                    <span className="meal-name">
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </span>
                    <div className="meal-details">
                      <span className="meal-percentage">{data.percentage}%</span>
                      <span className="meal-calories">{data.calories} kcal</span>
                    </div>
                  </div>
                  {!data.enabled && <Lock size={16} className="lock-icon" />}
                </div>
              ))}
            </div>
          </div>

          {/* 微量营养素卡片 */}
          <div className="card nutrients-card">
            <div className="card-header">
              <h3>Micronutrients</h3>
              <button 
                className={`btn-icon ${editingCard === 'micronutrients' ? 'active' : ''}`}
                onClick={() => handleEdit('micronutrients')}
              >
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
            </div>
            <div className="nutrients-grid">
              {Object.entries(micronutrients).map(([nutrient, data]) => (
                <div key={nutrient} className="nutrient-item">
                  <span className="nutrient-name">
                    {nutrient.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="nutrient-value">
                    <span>{data.amount}{data.unit}</span>
                    {!data.enabled && <Lock size={16} className="lock-icon" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="vitamins-grid">
              {Object.entries(vitamins).map(([vitamin, data]) => (
                <div key={vitamin} className="vitamin-item">
                  <span className="vitamin-name">
                    {vitamin.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="vitamin-value">
                    <span>
                      {data.amount}{data.unit} ({data.percentage}% DV)
                    </span>
                    {!data.enabled && <Lock size={16} className="lock-icon" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 运动目标卡片 */}
          <div className="card exercise-card">
            <div className="card-header">
              <h3>Exercise Goals</h3>
              <button 
                className={`btn-icon ${editingCard === 'exercise' ? 'active' : ''}`}
                onClick={() => handleEdit('exercise')}
              >
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
            </div>
            <div className="exercise-grid">
              <div className="exercise-item">
                <span>Calories Burned/Week</span>
                <span>{Math.round(BASE_CALORIES * 0.5)} kcal</span>
              </div>
              <div className="exercise-item">
                <span>Workouts/Week</span>
                <span>4</span>
              </div>
              <div className="exercise-item">
                <span>Minutes/Workout</span>
                <span>45 min</span>
              </div>
              <div className="exercise-item">
                <span>Exercise Calories</span>
                <span className="status enabled">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Goals;