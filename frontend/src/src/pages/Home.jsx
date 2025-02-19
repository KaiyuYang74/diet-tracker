import { useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/theme.css";
import "../styles/pages/Home.css";

// 色彩定义
const COLORS = [
  '#FF3366', // 红色 - 最大值
  '#FF9500', // 橙色 - 第二
  '#FFCC00', // 黄色 - 第三
  '#33CC33', // 绿色 - 最小
];

// 样例数据
const initialMealData = [
  { name: "Breakfast", value: 400 },
  { name: "Lunch", value: 600 },
  { name: "Dinner", value: 500 },
  { name: "Snacks", value: 200 }
];

const trendData = [
  { date: "Feb 5", calories: 1800 },
  { date: "Feb 6", calories: 2000 },
  { date: "Feb 7", calories: 1900 },
  { date: "Feb 8", calories: 2200 }
];

const weightData = [
  { date: "Feb 5", weight: 68 },
  { date: "Feb 6", weight: 67.8 },
  { date: "Feb 7", weight: 67.5 },
  { date: "Feb 8", weight: 67.2 }
];

function Home() {
  // 状态管理
  const [caloriesToday, setCaloriesToday] = useState(1700);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // 常量
  const goalCalories = 2000;
  const exerciseCalories = 0;
  
  // 数据处理
  const processedMealData = processMealData(initialMealData);
  const totalCalories = processedMealData.reduce((sum, item) => sum + item.value, 0);

  // 计算体重图表范围
  const getWeightDomain = () => {
    const weights = weightData.map(d => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  };

  return (
    <BaseLayout>
      <div className="page-container">
        <div className="grid-layout">
          {/* 今日卡路里卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>Today's Calories</h3>
            </div>
            <div className="calories-formula">
              Remains = Target - Foods + Sports
            </div>
            
            {/* 卡路里环形图 */}
            <CaloriesRing 
              current={caloriesToday}
              goal={goalCalories}
            />

            {/* 卡路里指标 */}
            <div className="calories-indicators">
              <CalorieIndicator label="Base Target" value={goalCalories} />
              <CalorieIndicator label="Food" value={caloriesToday} />
              <CalorieIndicator label="Exercise" value={exerciseCalories} />
            </div>
          </div>

          {/* 今日摄入分布图 */}
          <div className="card">
            <div className="card-header">
              <h3>Today's Intake</h3>
            </div>
            <div className="donut-container">
              <MealDistributionChart 
                data={processedMealData}
                selected={selectedMeal}
                hoveredIndex={hoveredIndex}
                onSelect={setSelectedMeal}
                onHover={setHoveredIndex}
                totalCalories={totalCalories}
              />
            </div>
          </div>

          {/* 卡路里趋势图 */}
          <div className="card">
            <div className="card-header">
              <h3>Calorie Trend</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calories" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 体重变化图 */}
          <div className="card">
            <div className="card-header">
              <h3>Weight Change</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={getWeightDomain()} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#FF8042" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

// 子组件定义
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

const CalorieIndicator = ({ label, value }) => (
  <div className="indicator">
    <span className="indicator-label">{label}</span>
    <span className="indicator-value">{value}</span>
  </div>
);

const MealDistributionChart = ({ data, selected, hoveredIndex, onSelect, onHover, totalCalories }) => (
  <div className="donut-wrapper">
    <PieChart width={300} height={300}>
      <defs>
        {COLORS.map((color, index) => (
          <radialGradient
            key={`gradient-${index}`}
            id={`gradient-${index}`}
            cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
          >
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.8} />
          </radialGradient>
        ))}
      </defs>

      <Pie
        data={data}
        cx="50%" cy="50%"
        innerRadius={75}
        outerRadius={95}
        paddingAngle={2}
        dataKey="value"
        onClick={(_, index) => onSelect(data[index])}
        onMouseEnter={(_, index) => onHover(index)}
        onMouseLeave={() => onHover(null)}
      >
        {data.map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={`url(#gradient-${index})`}
            className="donut-segment"
            style={{
              transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'center',
            }}
          />
        ))}
      </Pie>
    </PieChart>
    
    {selected && (
      <div className="donut-center-content">
        <div className="meal-name">{selected.name}</div>
        <div className="calorie-divider" />
        <div className="calorie-value">
          <span className="value" style={{ color: selected.color }}>
            {selected.value}
          </span>
          <span className="unit">kcal</span>
        </div>
        <div className="percentage">
          <span className="value" style={{ color: selected.color }}>
            {Math.round((selected.value / totalCalories) * 100)}
          </span>
          <span>%</span>
        </div>
      </div>
    )}
  </div>
);

// 辅助函数
function processMealData(data) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return data
    .map(item => ({
      ...item,
      percentage: (item.value / total) * 100
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .map((item, index) => ({
      ...item,
      color: COLORS[index]
    }));
}

export default Home;