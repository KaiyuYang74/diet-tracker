import BaseLayout from "../layouts/BaseLayout";
import "../styles/pages/Goals.css";

function Goals() {
  return (
    <BaseLayout>
      <div className="goals-container">
        {/* <div className="section-header">
          <h2>Your Fitness Goals</h2>
          <button className="guide-link">View Guide</button>
        </div> */}

        <div className="goals-grid">
          {/* 每日营养目标 */}
          <div className="goal-card">
            <div className="card-header">
              <h3>Daily Nutrition Goals</h3>
              <button className="edit-btn">Edit</button>
            </div>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <div className="item-header">
                  <span>Calories</span>
                  <span>2120</span>
                </div>
              </div>
              <div className="nutrition-item">
                <div className="item-header">
                  <span>Carbs</span>
                  <span>265g</span>
                </div>
                <div className="percentage">50%</div>
              </div>
              <div className="nutrition-item">
                <div className="item-header">
                  <span>Fat</span>
                  <span>71g</span>
                </div>
                <div className="percentage">30%</div>
              </div>
              <div className="nutrition-item">
                <div className="item-header">
                  <span>Protein</span>
                  <span>106g</span>
                </div>
                <div className="percentage">20%</div>
              </div>
            </div>
          </div>

          {/* 餐次卡路里分配 */}
          <div className="goal-card">
            <div className="card-header">
              <h3>Meal Calories Distribution</h3>
              <button className="edit-btn">Edit</button>
            </div>
            <div className="meals-grid">
              <div className="meal-item">
                <span>Breakfast</span>
                <span className="lock-icon">🔒</span>
              </div>
              <div className="meal-item">
                <span>Lunch</span>
                <span className="lock-icon">🔒</span>
              </div>
              <div className="meal-item">
                <span>Dinner</span>
                <span className="lock-icon">🔒</span>
              </div>
              <div className="meal-item">
                <span>Snacks</span>
                <span className="lock-icon">🔒</span>
              </div>
            </div>
          </div>

          {/* 微量营养素 */}
          <div className="goal-card">
            <div className="card-header">
              <h3>Micronutrients</h3>
              <button className="edit-btn">Edit</button>
            </div>
            <div className="nutrients-grid">
              <div className="nutrient-item">
                <span>Saturated Fat</span>
                <span>24g</span>
              </div>
              <div className="nutrient-item">
                <span>Polyunsaturated Fat</span>
                <span>0g</span>
              </div>
              <div className="nutrient-item">
                <span>Monounsaturated Fat</span>
                <span>0g</span>
              </div>
              <div className="nutrient-item">
                <span>Trans Fat</span>
                <span>0g</span>
              </div>
              <div className="nutrient-item">
                <span>Cholesterol</span>
                <span>300mg</span>
              </div>
              <div className="nutrient-item">
                <span>Sodium</span>
                <span>2300mg</span>
              </div>
              <div className="nutrient-item">
                <span>Potassium</span>
                <span>3500mg</span>
              </div>
              <div className="nutrient-item">
                <span>Fiber</span>
                <span>38g</span>
              </div>
              <div className="nutrient-item">
                <span>Sugar</span>
                <span>80g</span>
              </div>
            </div>
            <div className="vitamins-grid">
              <div className="vitamin-item">
                <span>Vitamin A</span>
                <span>100% DV</span>
              </div>
              <div className="vitamin-item">
                <span>Vitamin C</span>
                <span>100% DV</span>
              </div>
              <div className="vitamin-item">
                <span>Calcium</span>
                <span>100% DV</span>
              </div>
              <div className="vitamin-item">
                <span>Iron</span>
                <span>100% DV</span>
              </div>
            </div>
          </div>

          {/* 运动目标 */}
          <div className="goal-card">
            <div className="card-header">
              <h3>Exercise Goals</h3>
              <button className="edit-btn">Edit</button>
            </div>
            <div className="exercise-grid">
              <div className="exercise-item">
                <span>Calories Burned/Week</span>
                <span>0 kcal</span>
              </div>
              <div className="exercise-item">
                <span>Workouts/Week</span>
                <span>0</span>
              </div>
              <div className="exercise-item">
                <span>Minutes/Workout</span>
                <span>0</span>
              </div>
              <div className="exercise-item">
                <span>Exercise Calories</span>
                <span className="lock-icon">🔒 Off</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Goals;