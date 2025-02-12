import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/pages/Home.css";

// 色彩定义（从大到小的顺序）
const COLORS = {
  colors: [
    '#FF3366', // 红色 - 最大值
    '#FF9500', // 橙色 - 第二
    '#FFCC00', // 黄色 - 第三
    '#33CC33', // 绿色 - 最小
  ]
};

// 数据处理函数
const processData = (data) => {
  // 计算总卡路里
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // 添加百分比并排序
  const processedData = data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100
  }))
  .sort((a, b) => b.percentage - a.percentage)
  .map((item, index) => ({
    ...item,
    color: COLORS.colors[index]
  }));

  return processedData;
};

const sampleCalories = processData([
  { name: "Breakfast", value: 400 },
  { name: "Lunch", value: 600 },
  { name: "Dinner", value: 500 },
  { name: "Snacks", value: 200 }
]);

const sampleTrend = [
  { date: "Feb 5", calories: 1800 },
  { date: "Feb 6", calories: 2000 },
  { date: "Feb 7", calories: 1900 },
  { date: "Feb 8", calories: 2200 }
];

const sampleWeight = [
  { date: "Feb 5", weight: 68 },
  { date: "Feb 6", weight: 67.8 },
  { date: "Feb 7", weight: 67.5 },
  { date: "Feb 8", weight: 67.2 }
];

function Home() {
  const [caloriesToday, setCaloriesToday] = useState(1700);
  const goalCalories = 2000;
  const [selected, setSelected] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // 计算总卡路里
  const totalCalories = sampleCalories.reduce((sum, item) => sum + item.value, 0);

  return (
    <BaseLayout>
      <div className="home-container">
        <div className="chart-container">
          {/* Dashboard */}
          <div className="dashboard">
            <h2>Today's Calories</h2>
            <div className="calories-ring-container">
              <svg className="calories-ring" viewBox="0 0 200 200">
                {/* 背景圆环 */}
                <circle
                  className="ring-background"
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  strokeWidth="8"
                />
                {/* 进度圆环 */}
                <circle
                  className="ring-progress"
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={2 * Math.PI * 90 * (1 - Math.min(caloriesToday / goalCalories, 1))}
                  style={{
                    stroke: caloriesToday <= goalCalories ? '#82ca9d' : '#ff7875'
                  }}
                />
                {/* 超出部分的圆环 */}
                {caloriesToday > goalCalories && (
                  <circle
                    className="ring-overflow"
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={2 * Math.PI * 90 * (2 - caloriesToday / goalCalories)}
                    style={{
                      stroke: '#ff7875'
                    }}
                  />
                )}
              </svg>
              <div className="calories-text">
                <div className="current-calories">{caloriesToday}</div>
                <div className="goal-calories">of {goalCalories} kcal</div>
              </div>
            </div>
          </div>

          {/* 饼状图 */}
          <div className="chart-section donut-chart">
            <h3>Today's Intake</h3>
            <div className="donut-container">
              <div className="donut-wrapper">
                <PieChart width={300} height={300}>
                  {/* 定义渐变 */}
                  <defs>
                    {COLORS.colors.map((color, index) => (
                      <radialGradient
                        key={`gradient-${index}`}
                        id={`gradient-${index}`}
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                      >
                        <stop
                          offset="0%"
                          stopColor={color}
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor={color}
                          stopOpacity={0.8}
                        />
                      </radialGradient>
                    ))}
                  </defs>

                  <Pie
                    data={sampleCalories}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(data, index) => setSelected(sampleCalories[index])}
                    onMouseEnter={(_, index) => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {sampleCalories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gradient-${index})`}
                        className="donut-segment"
                        style={{
                          transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center',
                          outline: 'none'
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
                {/* 中心文字显示 */}
                {selected && (
                  <div 
                    className="donut-center-content"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      transition: 'all 300ms ease-in-out'
                    }}
                  >
                    <div className="meal-name">{selected.name}</div>
                    <div className="calorie-divider"></div>
                    <div className="calorie-value">
                      <span className="value" style={{ color: selected.color }}>{selected.value}</span>
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
            </div>
          </div>

          {/* 能量趋势折线图 */}
          <div className="chart-section">
            <h3>Calorie Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sampleTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 体重变化折线图 */}
          <div className="chart-section">
            <h3>Weight Change</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sampleWeight}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#FF8042" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Home;