import { useState, useEffect } from "react";
import BaseLayout from "../layouts/BaseLayout";
import { ChevronLeft, ChevronRight, Calendar, Edit2, Plus } from 'lucide-react';
import DateNavigation from "../components/DateNavigation";
import "../styles/theme.css";
import "../styles/pages/Diet.css";

function Diet() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [waterIntake, setWaterIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState(''); 

  // 示例数据
  const nutritionGoals = {
    calories: 2000,
    carbs: 250,
    fat: 67,
    protein: 100,
    sodium: 2300,
    sugar: 50
  };

  // 当日期变化时，可以从API获取数据
  useEffect(() => {
    // 这里可以添加API调用来获取特定日期的数据
    console.log("Date changed:", currentDate);
    
    // 模拟API调用
    // 将水摄入量重置为0，模拟获取新日期的数据
    setWaterIntake(0);
    
    // 实际应用中，可能需要执行以下操作：
    // fetchDietData(currentDate.toISOString().split('T')[0]);
  }, [currentDate]);

  const meals = [
    { id: 'breakfast', name: 'Breakfast', items: [], targetCalories: 600 },
    { id: 'lunch', name: 'Lunch', items: [], targetCalories: 700 },
    { id: 'dinner', name: 'Dinner', items: [], targetCalories: 500 },
    { id: 'snacks', name: 'Snacks', items: [], targetCalories: 200 }
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleAddWater = (amount) => {
    setWaterIntake(prev => Math.min(prev + amount, 4000)); // 设置上限为4000ml
  };

  const handleCustomWaterAdd = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      setWaterIntake(prev => Math.min(prev + amount, 4000)); // 设置上限为4000ml
      setCustomAmount(''); // 清空输入框
    }
  };

  // 处理输入框回车事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCustomWaterAdd();
    }
  };

  return (
    <BaseLayout>
      <div className="page-container">
          {/* 日期导航 */}
          <DateNavigation 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />

          <div className="grid-layout">
            {/* 左侧 - 餐食记录 */}
            <div className="meals-section">
              {meals.map(meal => (
                <div key={meal.id} className="card meal-card">
                  <div className="card-header">
                    <h3>{meal.name}</h3>
                    <div className="header-actions">
                      <span className="target-calories">{meal.targetCalories} kcal</span>
                      <button className="btn-icon">
                        <Plus size={18} />
                        <span>Add Food</span>
                      </button>
                    </div>
                  </div>
                  {meal.items.length === 0 ? (
                    <div className="empty-state">
                      <p>No items added yet</p>
                    </div>
                  ) : (
                    <div className="meal-items">
                      {/* 这里将来显示食物项目 */}
                    </div>
                  )}
                </div>
              ))}

              {/* 营养总计卡片 */}
              <div className="card nutrition-totals">
                <div className="card-header">
                  <h3>Nutrition Totals</h3>
                </div>
                <div className="totals-grid">
                  <div className="total-row">
                    <div className="total-label">Total</div>
                    <span>0 kcal</span>
                    <span>0g</span>
                    <span>0g</span>
                    <span>0g</span>
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
                    <span>{nutritionGoals.calories} kcal</span>
                    <span>{nutritionGoals.carbs}g</span>
                    <span>{nutritionGoals.fat}g</span>
                    <span>{nutritionGoals.protein}g</span>
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
                        style={{ width: `${Math.min((waterIntake / 2000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="water-target">Target: 2000ml</div>
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