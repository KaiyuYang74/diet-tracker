import React from 'react';

const CaloriesRing = ({ current, goal }) => {
  // 确定颜色
  const getColor = () => {
    // 剩余卡路里逻辑：负值为红色，低值为黄色，正常值为绿色
    if (current < 0) return "#ff7875"; // 负值显示红色
    if (current < goal * 0.2) return "#faad14"; // 少于20%显示黄色警告
    return "#82ca9d"; // 正常显示绿色
  };

  // 计算环形图进度 - 剩余卡路里/目标卡路里
  const calculateProgress = () => {
    // 确保进度在0-1之间
    return Math.max(0, Math.min(current / goal, 1));
  };

  return (
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
          strokeDashoffset={2 * Math.PI * 90 * (1 - calculateProgress())}
          style={{ stroke: getColor() }}
        />
      </svg>
      <div className="calories-text">
        <div className="current-calories">{Math.round(current)}</div>
        <div className="goal-calories">remaining of {goal} kcal</div>
      </div>
    </div>
  );
};

export default CaloriesRing;