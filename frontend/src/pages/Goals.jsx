import { useState, useEffect } from "react";
import { Edit2, Check, X, RotateCcw } from 'lucide-react';
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

function Goals() {
  // 编辑状态
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [editingMeals, setEditingMeals] = useState(false);
  
  // 保存原始值用于重置
  const [originalDistribution, setOriginalDistribution] = useState(initialDistribution);

  // 保存状态前的临时备份
  const [tempNutritionData, setTempNutritionData] = useState(null);
  const [tempMealsData, setTempMealsData] = useState(null);
  
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

  // 开始编辑营养目标
  const handleEditNutrition = () => {
    if (editingNutrition) {
      // 取消编辑，恢复到编辑前的状态
      if (tempNutritionData) {
        setDistribution(prev => ({
          ...prev,
          macronutrients: {...tempNutritionData}
        }));
      }
      setEditingNutrition(false);
    } else {
      // 开始编辑，保存当前状态用于取消时恢复
      setTempNutritionData({...distribution.macronutrients});
      setEditingNutrition(true);
    }
  };

  // 开始编辑餐次分配
  const handleEditMeals = () => {
    if (editingMeals) {
      // 取消编辑，恢复到编辑前的状态
      if (tempMealsData) {
        setDistribution(prev => ({
          ...prev,
          meals: {...tempMealsData}
        }));
      }
      setEditingMeals(false);
    } else {
      // 开始编辑，保存当前状态用于取消时恢复
      setTempMealsData({...distribution.meals});
      setEditingMeals(true);
    }
  };

  // 保存营养目标编辑
  const handleSaveNutrition = () => {
    // 清除临时备份
    setTempNutritionData(null);
    setEditingNutrition(false);
    // 这里可以添加API调用保存数据到后端
  };

  // 保存餐次分配编辑
  const handleSaveMeals = () => {
    // 清除临时备份
    setTempMealsData(null);
    setEditingMeals(false);
    // 这里可以添加API调用保存数据到后端
  };

  // 重置营养目标编辑
  const handleResetNutrition = () => {
    setDistribution(prev => ({
      ...prev, 
      macronutrients: {...initialDistribution.macronutrients}
    }));
  };

  // 重置餐次分配编辑
  const handleResetMeals = () => {
    setDistribution(prev => ({
      ...prev, 
      meals: {...initialDistribution.meals}
    }));
  };

  // 更新分配百分比
  const updateMacronutrient = (key, value) => {
    setDistribution(prev => ({
      ...prev,
      macronutrients: {
        ...prev.macronutrients,
        [key]: value
      }
    }));
  };

  // 更新餐次分配
  const updateMeal = (key, value) => {
    setDistribution(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
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
                className={`btn-icon ${editingNutrition ? 'active' : ''}`}
                onClick={handleEditNutrition}
              >
                {editingNutrition ? (
                  <>
                    <X size={18} />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={18} />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>
            <div className="nutrition-grid">
              <div className="nutrition-item highlight">
                <div className="item-header">
                  <span>Base Calories Goal</span>
                  <span>{BASE_CALORIES} kcal</span>
                </div>
              </div>
              

              {Object.entries(nutritionGoals).map(([nutrient, data]) => (
                nutrient !== 'calories' && (
                  <div key={nutrient} className="nutrition-item">
                    <div className="item-header">
                      <span className="nutrient-label">
                        {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                      </span>
                      
                      {editingNutrition ? (
                        <div className="edit-input">
                          <div className="input-group">
                            <input
                              type="number"
                              value={distribution.macronutrients[nutrient]}
                              onChange={(e) => updateMacronutrient(nutrient, Number(e.target.value))}
                              min="0"
                              max="100"
                              step="1"
                            />
                            <span className="input-suffix">%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="nutrient-values">
                          <span className="nutrient-percentage">{data.percentage}%</span>
                          <span className="nutrient-amount">{data.amount}g</span>
                        </div>
                      )}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{width: `${data.percentage}%`}}
                      />
                    </div>
                  </div>
                )
              ))}
              
              {editingNutrition && (
                <div className="action-buttons">
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleResetNutrition}
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveNutrition}
                  >
                    <Check size={16} />
                    Save
                  </button>
                </div>
              )}
              
              <div className="total-percentage">
                Total: {Object.values(distribution.macronutrients).reduce((sum, val) => sum + val, 0)}%
                {Object.values(distribution.macronutrients).reduce((sum, val) => sum + val, 0) !== 100 && 
                  <span className="warning">Should equal 100%</span>
                }
              </div>
            </div>
          </div>

          {/* 餐次分配卡片 */}
          <div className="card meal-card">
            <div className="card-header">
              <h3>Meal Distribution</h3>
              <button 
                className={`btn-icon ${editingMeals ? 'active' : ''}`}
                onClick={handleEditMeals}
              >
                {editingMeals ? (
                  <>
                    <X size={18} />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={18} />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>
            <div className="meals-grid">
              {Object.entries(mealDistribution).map(([meal, data]) => (
                <div key={meal} className="meal-item">
                  <div className="meal-info">
                    <span className="meal-name">
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </span>
                    
                    {editingMeals ? (
                      <div className="edit-input">
                        <div className="input-group">
                          <input
                            type="number"
                            value={distribution.meals[meal]}
                            onChange={(e) => updateMeal(meal, Number(e.target.value))}
                            min="0"
                            max="100"
                            step="1"
                          />
                          <span className="input-suffix">%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="meal-details">
                        <span className="meal-percentage">{data.percentage}%</span>
                        <span className="meal-calories">{data.calories} kcal</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {editingMeals && (
                <div className="action-buttons">
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleResetMeals}
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveMeals}
                  >
                    <Check size={16} />
                    Save
                  </button>
                </div>
              )}
              
              <div className="total-percentage">
                Total: {Object.values(distribution.meals).reduce((sum, val) => sum + val, 0)}%
                {Object.values(distribution.meals).reduce((sum, val) => sum + val, 0) !== 100 && 
                  <span className="warning">Should equal 100%</span>
                }
              </div>
            </div>
          </div>

          {/* 微量营养素卡片 - 移除了Edit按钮 */}
          <div className="card nutrients-card">
            <div className="card-header">
              <h3>Micronutrients</h3>
            </div>
            <div className="nutrients-grid">
              {Object.entries(micronutrients).map(([nutrient, data]) => (
                <div key={nutrient} className="nutrient-item">
                  <span className="nutrient-name">
                    {nutrient.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="nutrient-value">
                    <span>{data.amount}{data.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 运动目标卡片 - 移除了Edit按钮 */}
          <div className="card exercise-card">
            <div className="card-header">
              <h3>Exercise Goals</h3>
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