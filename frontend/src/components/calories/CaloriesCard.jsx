import React from 'react';
import CaloriesRing from './CaloriesRing';
import CalorieIndicator from './CalorieIndicator';
import '../../styles/components/calories/CaloriesRing.css';

const CaloriesCard = ({ caloriesToday, goalCalories, exerciseCalories, remainingCalories }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Today's Calories</h3>
      </div>
      <div className="calories-formula">
        Remains = Target - Foods + Sports
      </div>
      
      {/* 卡路里环形图 - 现在使用剩余卡路里 */}
      <CaloriesRing 
        current={caloriesToday - exerciseCalories}
        goal={goalCalories}
      />

      {/* 卡路里指标 */}
      <div className="calories-indicators">
        <CalorieIndicator label="Base Target" value={goalCalories} />
        <CalorieIndicator label="Food" value={caloriesToday} />
        <CalorieIndicator label="Exercise" value={exerciseCalories} />
        <CalorieIndicator label="Remaining" value={remainingCalories} />
      </div>
    </div>
  );
};

export default CaloriesCard;