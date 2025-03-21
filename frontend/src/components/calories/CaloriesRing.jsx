import React from 'react';

const CaloriesRing = ({ current, goal }) => (
  <div className="calories-ring-container">
    <svg className="calories-ring" viewBox="0 0 200 200">
      <circle
        className="ring-background"
        cx="100" cy="100" r="90"
        fill="none" strokeWidth="8"
      />
      <circle
        className="ring-progress"
        cx="100" cy="100" r="90"
        fill="none" strokeWidth="8"
        strokeDasharray={`${2 * Math.PI * 90}`}
        strokeDashoffset={2 * Math.PI * 90 * (1 - Math.min(current / goal, 1))}
        style={{ stroke: current <= goal ? '#82ca9d' : '#ff7875' }}
      />
      {current > goal && (
        <circle
          className="ring-overflow"
          cx="100" cy="100" r="90"
          fill="none" strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 90}`}
          strokeDashoffset={2 * Math.PI * 90 * (2 - current / goal)}
          style={{ stroke: '#ff7875' }}
        />
      )}
    </svg>
    <div className="calories-text">
      <div className="current-calories">{current}</div>
      <div className="goal-calories">of {goal} kcal</div>
    </div>
  </div>
);

export default CaloriesRing;