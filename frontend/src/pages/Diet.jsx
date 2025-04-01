import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { Edit2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useDiet } from "../context/DietContext";
import DateNavigation from "../components/DateNavigation";
import { useDietInputAPI } from "../api/dietInput"; // 更新API导入
import { useWaterIntakeAPI } from "../api/waterIntake"; //water intake
import api from "../api/axiosConfig";
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
  const dietInputAPI = useDietInputAPI(); // 使用API钩子
  const waterIntakeAPI = useWaterIntakeAPI(); // Use the water intake API
  
  const [currentDate, setCurrentDate] = useState(() => {
    const dateParam = new URLSearchParams(location.search).get('date');
    console.log("Date parameter from URL:", dateParam);
    
    if (dateParam) {
      try {
        const [year, month, day] = dateParam.split('-').map(Number);
        // 使用本地时间创建日期
        return new Date(year, month - 1, day, 0, 0, 0);
      } catch (error) {
        console.error("Error parsing date:", error);
        return new Date();
      }
    }
    return new Date();
  });


// 营养目标数据也改为状态变量
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2000,
    carbs: 250,
    fat: 67,
    protein: 100,
    sodium: 2300,
    sugar: 50
  });

  // 当日期变化时，获取该日期的饮食记录
  useEffect(() => {
    const fetchDietData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        
        // 使用更新后的API调用
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

        const waterData = await waterIntakeAPI.getUserWaterIntakeByDate(formattedDate);
        if (waterData && waterData.amount !== undefined) {
          setWaterIntake(waterData.amount);
        } else {
          setWaterIntake(0);
        }
        
      } catch (error) {
        console.error("Error fetching diet data:", error);
        // setError("Could not load your diet data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDietData();


  }, [currentDate]);

  // 添加此useEffect用于计算目标卡路里
  useEffect(() => {
    const calculateTargetCalories = async () => {
      // 从localStorage获取用户ID
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        // 获取用户数据
        const response = await api.get(`/users/${userId}`);
        const userData = response.data;

        // 提取用户基本信息，设置默认值以防数据缺失
        const userWeight = userData.weight || 70;
        const userHeight = userData.height || 170;
        const userAge = userData.age || 30;
        const goalType = userData.goalType || 'loss';

        console.log("用户数据:", {weight: userWeight, height: userHeight, age: userAge, goal: goalType});

        // 计算基础代谢率(BMR) - Mifflin-St Jeor公式
        const bmr = (10 * userWeight) + (6.25 * userHeight) - (5 * userAge) + 5;

        // 计算每日总能量消耗(TDEE)，使用中等活动水平系数1.55
        const tdee = bmr * 1.55;

        // 根据目标类型调整卡路里
        let targetCalories;
        switch(goalType) {
          case 'loss': // 减重目标
            targetCalories = Math.round(tdee - 500);
            break;
          case 'gain': // 增重目标
            targetCalories = Math.round(tdee + 300);
            break;
          case 'muscle': // 增肌目标
            targetCalories = Math.round(tdee);
            break;
          default:
            targetCalories = Math.round(tdee);
        }

        console.log("计算的目标卡路里:", targetCalories);

        // 更新营养目标
        setNutritionGoals(prev => ({
          ...prev,
          calories: targetCalories,
          // 根据新的卡路里目标计算碳水、脂肪和蛋白质
          carbs: Math.round(targetCalories * 0.5 / 4), // 50%碳水，每克4卡路里
          protein: Math.round(targetCalories * 0.2 / 4), // 20%蛋白质，每克4卡路里
          fat: Math.round(targetCalories * 0.3 / 9), // 30%脂肪，每克9卡路里
        }));

        // 更新餐次目标卡路里
        setMealTypes([
          { id: 'breakfast', name: 'Breakfast', targetCalories: Math.round(targetCalories * 0.3) }, // 早餐30%
          { id: 'lunch', name: 'Lunch', targetCalories: Math.round(targetCalories * 0.4) }, // 午餐40%
          { id: 'dinner', name: 'Dinner', targetCalories: Math.round(targetCalories * 0.3) }, // 晚餐30%
          { id: 'snacks', name: 'Snacks', targetCalories: Math.round(targetCalories * 0.1) } // 零食10%
        ]);
      } catch (error) {
        console.error("计算目标卡路里时出错:", error);
      }
    };

    // 调用计算函数
    calculateTargetCalories();
  }, []); // 空依赖数组，组件挂载时只执行一次

  // 定义餐次类型
// 将硬编码的餐次变为状态变量
  const [mealTypes, setMealTypes] = useState([
    { id: 'breakfast', name: 'Breakfast', targetCalories: 600 },
    { id: 'lunch', name: 'Lunch', targetCalories: 700 },
    { id: 'dinner', name: 'Dinner', targetCalories: 500 },
    { id: 'snacks', name: 'Snacks', targetCalories: 200 }
  ]);

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

  const handleAddWater = async (amount) => {
    // setWaterIntake(prev => Math.min(prev + amount, 4000));
    const newAmount = Math.min(waterIntake + amount, 4000);
    setWaterIntake(newAmount);
    
    try {
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      await waterIntakeAPI.saveWaterIntake(newAmount, formattedDate);
    } catch (error) {
      console.error("Failed to save water intake:", error);
      setError("Failed to save water intake. Please try again.");
    }
  };

  const handleCustomWaterAdd = async () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      // setWaterIntake(prev => Math.min(prev + amount, 4000));
      await handleAddWater(amount);
      setCustomAmount('');
    }
  };

  const handleResetWater = async () => {
    setWaterIntake(0);
    
    try {
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      await waterIntakeAPI.saveWaterIntake(0, formattedDate);
    } catch (error) {
      console.error("Failed to reset water intake:", error);
      setError("Failed to reset water intake. Please try again.");
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
    // 使用currentDate作为日期参数
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    navigate(`/food-search?meal=${mealType}&date=${formattedDate}`);
  };
  
  // 处理删除食物项的函数
  const handleDeleteFoodItem = async (mealType, item) => {
    console.log("Deleting diet item with ID:", item.dietID);
    console.log("Item object:", item);

    if (item.dietID) {
      try {
        await dietInputAPI.deleteDietInput(item.dietID);
        console.log("Successfully deleted diet item");
        removeFood(mealType, item.id);
      } catch (err) {
        console.error("Failed to delete item:", err);
        setError("Failed to delete the item. Please try again.");
      }
    } else {
      // 仅从前端状态移除
      removeFood(mealType, item.id);
    }
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
                              onClick={() => handleDeleteFoodItem(mealType.id, item)}
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
                  <button 
                  className="btn-icon" 
                  onClick={handleResetWater} 
                  title="Reset water intake"
                  >
                    <RefreshCw size={18} />
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