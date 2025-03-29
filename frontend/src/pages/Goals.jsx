import { useState, useEffect } from "react";
import BaseLayout from "../layouts/BaseLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import "../styles/theme.css";
import "../styles/pages/Goals.css";

function Goals() {
  const { currentUser } = useAuth();
  const [goalCalories, setGoalCalories] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 营养素比例常量
  const NUTRITION_RATIOS = {
    carbs: 50,
    protein: 20,
    fat: 30,
  };

  // 餐次分配常量
  const MEAL_DISTRIBUTION = {
    breakfast: 30,
    lunch: 40,
    dinner: 30,
  };

  // 零食卡路里计算 - 额外的10%
  const SNACK_CALORIES = (calories) => Math.round(calories * 0.1);

  // 转换常量
  const PROTEIN_CALORIES_PER_GRAM = 4;
  const CARBS_CALORIES_PER_GRAM = 4;
  const FAT_CALORIES_PER_GRAM = 9;

  // 加载用户数据
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.id) {
        try {
          setLoading(true);

          const response = await api.get(`/users/${currentUser.id}`);
          const userData = response.data;

          if (userData) {
            const userWeight = userData.weight || 70;
            const userHeight = userData.height || 170;
            const userAge = userData.age || 30;
            const goalType = userData.goalType || 'loss';

            // 计算BMR
            const bmr = (10 * userWeight) + (6.25 * userHeight) - (5 * userAge) + 5;

            // 计算TDEE
            const tdee = bmr * 1.55;

            // 根据目标调整卡路里
            let calculatedGoalCalories;
            switch(goalType) {
              case 'loss':
                calculatedGoalCalories = Math.round(tdee - 500);
                break;
              case 'gain':
                calculatedGoalCalories = Math.round(tdee + 300);
                break;
              case 'muscle':
                calculatedGoalCalories = Math.round(tdee);
                break;
              default:
                calculatedGoalCalories = Math.round(tdee);
            }

            setGoalCalories(calculatedGoalCalories);
          }
        } catch (err) {
          console.error("加载用户数据失败:", err);
          setError("无法加载用户数据，使用默认值");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // 计算营养目标
  const calculateNutritionGoals = () => {
    const carbsCalories = (goalCalories * NUTRITION_RATIOS.carbs) / 100;
    const proteinCalories = (goalCalories * NUTRITION_RATIOS.protein) / 100;
    const fatCalories = (goalCalories * NUTRITION_RATIOS.fat) / 100;

    return {
      calories: goalCalories,
      carbs: {
        amount: Math.round(carbsCalories / CARBS_CALORIES_PER_GRAM),
        percentage: NUTRITION_RATIOS.carbs
      },
      protein: {
        amount: Math.round(proteinCalories / PROTEIN_CALORIES_PER_GRAM),
        percentage: NUTRITION_RATIOS.protein
      },
      fat: {
        amount: Math.round(fatCalories / FAT_CALORIES_PER_GRAM),
        percentage: NUTRITION_RATIOS.fat
      }
    };
  };

  const nutritionGoals = calculateNutritionGoals();

  return (
      <BaseLayout>
        <div className="page-container">
          <div className="grid-layout">
            {loading && (
                <div className="loading-state" style={{textAlign: 'center', padding: '20px', gridColumn: '1 / -1'}}>
                  正在加载用户数据...
                </div>
            )}

            {error && (
                <div className="error-message" style={{
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: '#fff0f0',
                  borderRadius: '5px',
                  color: '#d32f2f',
                  textAlign: 'center',
                  gridColumn: '1 / -1'
                }}>
                  {error}
                </div>
            )}

            {/* 每日营养目标卡片 */}
            <div className="card nutrition-card">
              <div className="card-header">
                <h3>Daily Nutrition Goals</h3>
              </div>
              <div className="nutrition-grid">
                <div className="nutrition-item highlight">
                  <div className="item-header">
                    <span>Base Calories Goal</span>
                    <span>{goalCalories} kcal</span>
                  </div>
                </div>

                {Object.entries(nutritionGoals).map(([nutrient, data]) => (
                    nutrient !== 'calories' && (
                        <div key={nutrient} className="nutrition-item">
                          <div className="item-header">
                      <span className="nutrient-label">
                        {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                      </span>
                            <div className="nutrient-values">
                              <span className="nutrient-percentage">{data.percentage}%</span>
                              <span className="nutrient-amount">{data.amount}g</span>
                            </div>
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

                <div className="total-percentage">
                  Total: 100%
                </div>
              </div>
            </div>

            {/* 餐次分配卡片 */}
            <div className="card meal-card">
              <div className="card-header">
                <h3>Meal Distribution</h3>
              </div>
              <div className="meals-grid">
                {/* 主要餐次 */}
                {Object.entries(MEAL_DISTRIBUTION).map(([meal, percentage]) => (
                    <div key={meal} className="meal-item">
                      <div className="meal-info">
                    <span className="meal-name">
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </span>
                        <div className="meal-details">
                          <span className="meal-percentage">{percentage}%</span>
                          <span className="meal-calories">{Math.round((goalCalories * percentage) / 100)} kcal</span>
                        </div>
                      </div>
                    </div>
                ))}

                {/* 零食项 - 使用特殊样式 */}
                <div className="meal-item" style={{borderTop: '1px dashed #ddd', marginTop: '10px', paddingTop: '10px'}}>
                  <div className="meal-info">
                    <span className="meal-name">Snacks</span>
                    <div className="meal-details">
                    <span className="meal-tag" style={{
                      backgroundColor: '#f0f0f0',
                      color: '#888',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.8em'
                    }}>Optional</span>
                      <span className="meal-calories">{SNACK_CALORIES(goalCalories)} kcal</span>
                    </div>
                  </div>
                </div>

                <div className="total-percentage">
                  Main Meals Total: 100%
                </div>
              </div>
            </div>

            {/* 微量营养素卡片 */}
            <div className="card nutrients-card">
              <div className="card-header">
                <h3>Micronutrients</h3>
              </div>
              <div className="nutrients-grid">
                <div className="nutrient-item">
                  <span className="nutrient-name">Saturated Fat</span>
                  <div className="nutrient-value">
                    <span>{Math.round(goalCalories * 0.1 / FAT_CALORIES_PER_GRAM)}g</span>
                  </div>
                </div>
                <div className="nutrient-item">
                  <span className="nutrient-name">Fiber</span>
                  <div className="nutrient-value">
                    <span>{Math.round(goalCalories / 1000 * 14)}g</span>
                  </div>
                </div>
                <div className="nutrient-item">
                  <span className="nutrient-name">Sodium</span>
                  <div className="nutrient-value">
                    <span>2300mg</span>
                  </div>
                </div>
                <div className="nutrient-item">
                  <span className="nutrient-name">Sugar</span>
                  <div className="nutrient-value">
                    <span>{Math.round(goalCalories * 0.1 / CARBS_CALORIES_PER_GRAM)}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 运动目标卡片 */}
            <div className="card exercise-card">
              <div className="card-header">
                <h3>Exercise Goals</h3>
              </div>
              <div className="exercise-grid">
                <div className="exercise-item">
                  <span>Calories Burned/Week</span>
                  <span>{Math.round(goalCalories * 0.5)} kcal</span>
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