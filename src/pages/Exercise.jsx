import { useState } from "react";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/pages/Exercise.css";

function Exercise() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 日期导航
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <BaseLayout>
      <div className="exercise-container">
        <div className="exercise-content">
          {/* 日期导航 */}
          <div className="date-navigation">
            <button className="nav-btn">◀</button>
            <div className="current-date">{formatDate(currentDate)}</div>
            <button className="nav-btn">▶</button>
            <button className="calendar-btn">📅</button>
          </div>

          {/* 心肺运动区域 */}
          <div className="exercise-section cardio">
            <div className="section-header">
              <h2>Cardio Exercise</h2>
              <div className="header-columns">
                <div className="column">Minutes</div>
                <div className="column">Calories Burned</div>
              </div>
            </div>
            
            <div className="section-actions">
              <button className="add-exercise-btn">Add Exercise</button>
              <button className="quick-tools-btn">Quick Tools</button>
            </div>

            <div className="totals-rows">
              <div className="total-row">
                <div className="row-label">Daily Total / Goal</div>
                <div className="row-values">
                  <span>0 / 0</span>
                  <span>0 / 0</span>
                </div>
              </div>
              <div className="total-row">
                <div className="row-label">Weekly Total / Goal</div>
                <div className="row-values">
                  <span>0 / 0</span>
                  <span>0 / 0</span>
                </div>
              </div>
            </div>
          </div>

          {/* 肌力训练区域 */}
          <div className="exercise-section strength">
            <div className="section-header">
              <h2>Strength Training</h2>
              <div className="header-columns">
                <div className="column">Sets</div>
                <div className="column">Reps/Set</div>
                <div className="column">Weight/Set</div>
              </div>
            </div>
            
            <div className="section-actions">
              <button className="add-exercise-btn">Add Exercise</button>
              <button className="quick-tools-btn">Quick Tools</button>
            </div>
          </div>

          {/* 运动记录区域 */}
          <div className="exercise-section notes">
            <div className="notes-header">
              <h2>Exercise Notes</h2>
              <button className="edit-btn">Edit</button>
            </div>
            <textarea 
              className="notes-input" 
              placeholder="Record your exercise notes here..."
            />
          </div>

          {/* 完成按钮 */}
          <button className="complete-btn">Complete This Entry</button>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Exercise;