import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useDiet } from "../context/DietContext";
import DateNavigation from "../components/DateNavigation";
import { dietInputAPI } from "../api/dietInput";
import "../styles/theme.css";
import "../styles/pages/Diet.css";

function Diet() {
  const navigate = useNavigate();
  const [waterIntake, setWaterIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { meals, setMeals, removeFood, calculateMealTotals, calculateDailyTotals } = useDiet();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(() => {
    const dateParam = new URLSearchParams(location.search).get('date');
    console.log("Date parameter from URL:", dateParam);
    
    if (dateParam) {
      try {
        // 简单处理YYYY-MM-DD格式的日期字符串
        // 这样避免了时区问题
        const [year, month, day] = dateParam.split('-').map(Number);
        // 注意月份需要减1，因为Date对象中月份是从0开始的
        const parsedDate = new Date(year, month - 1, day);
        console.log("Parsed date:", parsedDate);
        return parsedDate;
      } catch (error) {
        console.error("Error parsing date:", error);
        return new Date();
      }
    }
    return new Date();
  });

  // 营养目标数据
  const nutritionGoals = {
    calories: 2000,
    carbs: 250,
    fat: 67,
    protein: 100,
    sodium: 2300,
    sugar: 50
  };

  // 当日期变化时，获取该日期的饮食记录
  useEffect(() => {
    const fetchDietData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const formattedDate = currentDate.toISOString().split('T')[0];
        
        // 不需要传递用户ID，API会使用当前登录用户的ID
        const dietData = await dietInputAPI.getUserDietByDate(formattedDate);
        
        if (dietData && Array.isArray(dietData)) {
          console.log("Received diet data:", dietData);
          
          // 处理返回的数据并更新状态
          const processedData = processDietData(dietData);
          
          // 如果DietContext提供了setMeals方法，使用它更新状态
          if (typeof setMeals === 'function') {
            setMeals(processedData);
          } else {
            console.warn("setMeals function not available in context");
          }
        } else {
          console.log("No diet data found for this date or data is not in expected format");
        }
      } catch (error) {
        console.error("Error fetching diet data:", error);
        // setError("Could not load your diet data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDietData();
  }, [currentDate, setMeals]);

  // 定义餐次类型
  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', targetCalories: 600 },
    { id: 'lunch', name: 'Lunch', targetCalories: 700 },
    { id: 'dinner', name: 'Dinner', targetCalories: 500 },
    { id: 'snacks', name: 'Snacks', targetCalories: 200 }
  ];

  // 处理从后端获取的饮食数据
  const processDietData = (dietData) => {
    // 按meal_type分组
    const result = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };
    
    dietData.forEach(item => {
      if (result[item.dietType.toLowerCase()]) {
        result[item.dietType.toLowerCase()].push({
          id: item.dietID.toString(),
          dietID: item.dietID,
          name: item.food ? item.food.food : "Unknown food",
          calories: item.calories,
          protein: item.food ? item.food.protein : 0,
          fat: item.food ? item.food.fat : 0,
          carbs: item.food ? item.food.carbohydrates : 0,
          quantity: 1,
          servingSize: "100g"
        });
      }
    });
    
    return result;
  };

  const handleAddWater = (amount) => {
    setWaterIntake(prev => Math.min(prev + amount, 4000));
  };

  const handleCustomWaterAdd = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      setWaterIntake(prev => Math.min(prev + amount, 4000));
      setCustomAmount('');
    }
  };

  // 处理输入框回车事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCustomWaterAdd();
    }
  };
  
  // 处理添加食品按钮点击
  const handleAddFoodClick = (mealType) => {
    const formattedDate = currentDate.toISOString().split('T')[0];
    navigate(`/food-search?meal=${mealType}&date=${formattedDate}`);
  };

  // 计算营养总计
  const dailyTotals = calculateDailyTotals();

  // 计算剩余营养值
  const remainingNutrition = {
    calories: nutritionGoals.calories - dailyTotals.calories,
    carbs: nutritionGoals.carbs - dailyTotals.carbs,
    fat: nutritionGoals.fat - dailyTotals.fat,
    protein: nutritionGoals.protein - dailyTotals.protein
  };

  return (
    <BaseLayout>
      <div className="page-container">
          {/* 加载和错误状态显示 */}
          {loading && <div className="loading-message">Loading your diet data...</div>}
          {error && <div className="error-message">{error}</div>}
          
          {/* 日期导航 */}
          <DateNavigation 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />

          <div className="grid-layout">
            {/* 左侧 - 餐食记录 */}
            <div className="meals-section">
              {mealTypes.map(mealType => {
                // 获取餐次的食物项
                const mealItems = meals[mealType.id] || [];
                // 计算餐次的营养总量
                const mealTotals = calculateMealTotals(mealType.id);
                
                return (
                  <div key={mealType.id} className="card meal-card">
                    <div className="card-header">
                      <h3>{mealType.name}</h3>
                      <div className="header-actions">
                        <span className="target-calories">
                          {mealTotals?.calories > 0 
                            ? `${Math.round(mealTotals.calories)}/${mealType.targetCalories}`
                            : `${mealType.targetCalories}`} kcal
                        </span>
                        <button 
                          className="btn-icon"
                          onClick={() => handleAddFoodClick(mealType.id)}
                        >
                          <Plus size={18} />
                          <span>Add Food</span>
                        </button>
                      </div>
                    </div>
                    {mealItems.length === 0 ? (
                      <div className="empty-state">
                        <p>No items added yet</p>
                      </div>
                    ) : (
                      <div className="meal-items">
                        {mealItems.map(item => (
                          <div key={item.id} className="food-item">
                            <div className="food-info">
                              <div className="food-name">{item.name}</div>
                              <div className="food-details">
                                {item.quantity} {item.servingSize}, {Math.round(item.calories * item.quantity)} cal
                              </div>
                            </div>
                            <button 
                              className="btn-icon delete-btn"
                              onClick={() => {
                                // 打印要删除的 dietId
                                console.log("Deleting diet item with ID:", item.dietID);
                                console.log("Item object:", item)

                                if (item.dietID) {
                                  dietInputAPI.deleteDietInput(item.dietID)
                                    .then(() => {
                                      console.log("Successfully deleted diet item");
                                      removeFood(mealType.id, item.id);
                                    })
                                    .catch(err => {
                                      console.error("Failed to delete item:", err);
                                    });
                                } else {
                                  // 仅从前端状态移除
                                  removeFood(mealType.id, item.id);
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 营养总计卡片 */}
              <div className="card nutrition-totals">
                <div className="card-header">
                  <h3>Nutrition Totals</h3>
                </div>
                <div className="totals-grid">
                  <div className="total-row">
                    <div className="total-label">Total</div>
                    <span>{Math.round(dailyTotals.calories)} kcal</span>
                    <span>{dailyTotals.carbs.toFixed(1)}g</span>
                    <span>{dailyTotals.fat.toFixed(1)}g</span>
                    <span>{dailyTotals.protein.toFixed(1)}g</span>
                  </div>
                  <div className="total-row">
                    <div className="total-label">Daily Goal</div>
                    <span>{nutritionGoals.calories} kcal</span>
                    <span>{nutritionGoals.carbs}g</span>
                    <span>{nutritionGoals.fat}g</span>
                    <span>{nutritionGoals.protein}g</span>
                  </div>
                  <div className="total-row">
                    <div className="total-label">Remaining</div>
                    <span>{Math.round(remainingNutrition.calories)} kcal</span>
                    <span>{remainingNutrition.carbs.toFixed(1)}g</span>
                    <span>{remainingNutrition.fat.toFixed(1)}g</span>
                    <span>{remainingNutrition.protein.toFixed(1)}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 饮水记录部分 */}
            <div className="water-section">
              <div className="card water-card">
                <div className="card-header">
                  <h3>Water Intake</h3>
                  <button className="btn-icon">
                    <Edit2 size={18} />
                  </button>
                </div>

                <div className="water-content">
                  <div className="water-display">
                    <span className="amount">{waterIntake}</span>
                    <span className="unit">ml</span>
                  </div>

                  <div className="water-progress-container">
                    <div className="water-progress">
                      <div 
                        className="water-progress-fill"
                        style={{ width: `${Math.min((waterIntake / 4000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="water-target">Target: 4000ml</div>
                  </div>

                  <div className="quick-add">
                    <h4>Quick Add</h4>
                    <div className="quick-buttons">
                      <button className="btn-outline" onClick={() => handleAddWater(250)}>+250 ml</button>
                      <button className="btn-outline" onClick={() => handleAddWater(500)}>+500 ml</button>
                      <button className="btn-outline" onClick={() => handleAddWater(1000)}>+1000 ml</button>
                    </div>
                  </div>

                  <div className="custom-add">
                    <div className="input-group">
                      <input 
                        type="number" 
                        className="form-input"
                        placeholder="Enter amount" 
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        onKeyPress={handleKeyPress}
                        min="0"
                        max="4000"
                      />
                      <span className="input-unit">ml</span>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={handleCustomWaterAdd}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary complete-btn">
            Complete This Entry
          </button>
      </div>
    </BaseLayout>
  );
}

export default Diet;