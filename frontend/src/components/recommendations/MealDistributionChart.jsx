import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const MealDistributionChart = ({ 
  data, 
  selected, 
  hoveredIndex, 
  onSelect, 
  onHover, 
  totalCalories,
  showRecommendations,
  onEnlightenMe,
  loadingRecommendation
}) => {
  const cx = 150; // 饼图中心 X
  const cy = 150; // 饼图中心 Y
  const radius = 60; // 文字绕的半径，靠近内圈

  // 计算每个标签的位置 - 从3点钟位置开始，逆时针布局
  const labels = data.map((entry, index) => {
    
    const startAngleRad = ((entry.midAngle - 90) * Math.PI) / 180;
    const endAngleRad = ((entry.midAngle + 30) * Math.PI) / 180;
    
    const x1 = cx + radius * Math.cos(startAngleRad);
    const y1 = cy + radius * Math.sin(startAngleRad);
    const x2 = cx + radius * Math.cos(endAngleRad);
    const y2 = cy + radius * Math.sin(endAngleRad);

    const pathData = `M ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2}`;
    
    return {
      name: entry.name,
      color: entry.color,
      path: pathData,
      offset: "50%",
      side: index === 0 ? "left" : "right",
    };
  });

  return (
    <div className="donut-wrapper">
      {/* 主饼图 */}
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={75}
          outerRadius={95}
          paddingAngle={2}
          startAngle={0} // 从右侧3点钟方向开始
          endAngle={360}  // 完整圆
          dataKey="value"
          onClick={(_, index) => onSelect(data[index])}
          onMouseEnter={(_, index) => onHover(index)}
          onMouseLeave={() => onHover(null)}
          isAnimationActive={true} // 禁用动画，确保稳定的文字位置
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              className="donut-segment"
              style={{
                transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: 'center',
              }}
            />
          ))}
        </Pie>
      </PieChart>

      {/* 三餐标签 */}
      {showRecommendations && (
        <svg 
          width="300" 
          height="300" 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 25
          }}
        >
          <defs>
            {labels.map((label, index) => (
              <path 
                key={`path-${index}`} 
                id={`textPath-${index}`} 
                d={label.path} 
                fill="none" 
              />
            ))}
          </defs>

          {labels.map((label, index) => (
            <text
              key={`text-${index}`}
              fill={label.color}
              fontSize="13"
              fontWeight="bold"
              style={{ 
                textShadow: "0px 0px 2px white",
                dominantBaseline: "middle", // 确保文字垂直居中
              }}
            >
              <textPath 
                href={`#textPath-${index}`} 
                startOffset={label.offset}
                side={label.side} // 根据位置调整文字方向
              >
                {label.name}
              </textPath>
            </text>
          ))}
        </svg>
      )}

      {/* 中央内容 */}
      {!selected ? (
        <button 
          className="enlighten-me-btn"
          onClick={onEnlightenMe}
          disabled={loadingRecommendation}
        >
          {loadingRecommendation ? '...' : 'AI'}
        </button>
      ) : (
        <div className="donut-center-content">
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
};

export default MealDistributionChart;