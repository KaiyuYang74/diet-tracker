import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Edit2 } from 'lucide-react';
import BaseLayout from "../layouts/BaseLayout";
import "../styles/theme.css";
import "../styles/pages/Exercise.css";


function Exercise() {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      <div className="page-container">
        {/* 日期导航 */}
        <div className="date-nav">
          <button className="btn-icon">
            <ChevronLeft size={20} />
          </button>
          <div className="current-date">{formatDate(currentDate)}</div>
          <button className="btn-icon">
            <ChevronRight size={20} />
          </button>
          <button className="btn-icon">
            <Calendar size={20} />
          </button>
        </div>

        <div className="grid-layout">
          {/* 心肺运动卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>Cardio Exercise</h3>
              <button className="btn-icon">
                <Edit2 size={18} />
                <span>Add Exercise</span>
              </button>
            </div>
            
            <div className="data-row">
              <span className="data-label">Daily Total / Goal</span>
              <div className="data-value">
                <span>0 / 30 min</span>
                <span>0 / 300 kcal</span>
              </div>
            </div>

            <div className="data-row">
              <span className="data-label">Weekly Total / Goal</span>
              <div className="data-value">
                <span>0 / 150 min</span>
                <span>0 / 1500 kcal</span>
              </div>
            </div>
          </div>

          {/* 力量训练卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>Strength Training</h3>
              <button className="btn-icon">
                <Edit2 size={18} />
                <span>Add Exercise</span>
              </button>
            </div>
            
            <div className="data-row">
              <span className="data-label">Weekly Goal</span>
              <span className="data-value">3 sessions</span>
            </div>

            <div className="exercise-log empty">
              <p>No strength training logged today</p>
              <button className="btn-primary">Add Workout</button>
            </div>
          </div>

          {/* 运动记录卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>Exercise Notes</h3>
              <button className="btn-icon">
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
            </div>
            <textarea 
              className="form-input"
              placeholder="Record your exercise notes here..."
              rows={4}
            />
          </div>
        </div>

        {/* 完成按钮 */}
        <button className="btn btn-primary complete-btn">
          Complete This Entry
        </button>
      </div>
    </BaseLayout>
  );
}

export default Exercise;