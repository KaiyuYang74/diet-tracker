import { useState } from "react";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/pages/Diet.css";

function Diet() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [waterIntake, setWaterIntake] = useState(0);

  // 示例数据
  const nutritionGoals = {
    calories: 2120,
    carbs: 265,
    fat: 71,
    protein: 106,
    sodium: 2300,
    sugar: 80
  };

  const meals = [
    { id: 'breakfast', name: 'Breakfast', items: [] },
    { id: 'lunch', name: 'Lunch', items: [] },
    { id: 'dinner', name: 'Dinner', items: [] },
    { id: 'snacks', name: 'Snacks', items: [] }
  ];

  // 日期导航
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleAddWater = (amount) => {
    setWaterIntake(prev => prev + amount);
  };

  return (
    <BaseLayout>
      <div className="diet-container">
        <div className="diet-content">
          {/* 日期导航 */}
          <div className="date-navigation">
            <button className="nav-btn">◀</button>
            <div className="current-date">{formatDate(currentDate)}</div>
            <button className="nav-btn">▶</button>
            <button className="calendar-btn">📅</button>
          </div>

          {/* 主要内容区域 */}
          <div className="diet-grid">
            {/* 左侧 - 餐食记录 */}
            <div className="meals-section">
              {meals.map(meal => (
                <div key={meal.id} className="meal-card">
                  <div className="meal-header">
                    <h3>{meal.name}</h3>
                    <div className="meal-actions">
                      <button className="add-food-btn">Add Food</button>
                      <button className="quick-tools-btn">Quick Tools</button>
                    </div>
                  </div>
                  {meal.items.length === 0 ? (
                    <div className="empty-meal">No items added yet</div>
                  ) : (
                    <div className="meal-items">
                      {/* 这里将来显示食物项目 */}
                    </div>
                  )}
                </div>
              ))}

              {/* 总计区域 */}
              <div className="nutrition-totals">
                <div className="totals-row">
                  <div className="total-label">Total</div>
                  <div className="total-values">
                    <span>0</span>
                    <span>0</span>
                    <span>0</span>
                    <span>0</span>
                    <span>0</span>
                    <span>0</span>
                  </div>
                </div>
                <div className="totals-row">
                  <div className="total-label">Your Daily Goal</div>
                  <div className="total-values">
                    <span>{nutritionGoals.calories}</span>
                    <span>{nutritionGoals.carbs}</span>
                    <span>{nutritionGoals.fat}</span>
                    <span>{nutritionGoals.protein}</span>
                    <span>{nutritionGoals.sodium}</span>
                    <span>{nutritionGoals.sugar}</span>
                  </div>
                </div>
                <div className="totals-row">
                  <div className="total-label">Remaining</div>
                  <div className="total-values remaining">
                    <span>{nutritionGoals.calories}</span>
                    <span>{nutritionGoals.carbs}</span>
                    <span>{nutritionGoals.fat}</span>
                    <span>{nutritionGoals.protein}</span>
                    <span>{nutritionGoals.sodium}</span>
                    <span>{nutritionGoals.sugar}</span>
                  </div>
                </div>
              </div>

              <button className="complete-btn">Complete This Entry</button>
            </div>

            {/* 右侧 - 饮水记录 */}
            <div className="water-section">
              <div className="water-card">
                <h3>Water Intake</h3>
                <div className="water-content">
                  <div className="water-amount">
                    <span className="amount">{waterIntake}</span>
                    <span className="unit">ml</span>
                    <button className="edit-btn">✎</button>
                  </div>
                  <div className="water-visual">
                    {/* 这里可以添加水杯图标 */}
                    🥤
                  </div>
                  <div className="quick-add">
                    <h4>Quick Add</h4>
                    <div className="quick-buttons">
                      <button onClick={() => handleAddWater(250)}>+250 ml</button>
                      <button onClick={() => handleAddWater(500)}>+500 ml</button>
                      <button onClick={() => handleAddWater(1000)}>+1000 ml</button>
                    </div>
                  </div>
                  <div className="custom-add">
                    <input type="number" placeholder="Enter amount" />
                    <span className="unit">ml</span>
                    <button className="add-btn">Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Diet;