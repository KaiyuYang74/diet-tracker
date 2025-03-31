import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { useDietInputAPI } from "../../api/dietInput";

const CalorieTrendChart = ({ goalCalories = 2000 }) => {
  const [calorieData, setCalorieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dietInputAPI = useDietInputAPI();

  useEffect(() => {
    const fetchCalorieData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 获取过去7天的日期
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date);
        }
        
        // 获取每天的饮食数据
        const dailyData = [];
        for (const date of dates) {
          // 格式化日期为API所需格式 YYYY-MM-DD
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          
          try {
            // 获取该日期的饮食数据
            const dietData = await dietInputAPI.getUserDietByDate(formattedDate);
            
            // 计算该日期的总卡路里
            let totalCalories = 0;
            if (dietData && Array.isArray(dietData)) {
              totalCalories = dietData.reduce((sum, item) => sum + (item.calories || 0), 0);
            }
            
            // 添加到结果数组
            dailyData.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              calories: totalCalories,
              fullDate: date
            });
          } catch (err) {
            console.error(`Error fetching diet data for ${formattedDate}:`, err);
            // 即使某天数据获取失败，仍然添加到结果中，但卡路里为0
            dailyData.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              calories: 0,
              fullDate: date
            });
          }
        }
        
        // 按日期排序（从旧到新）
        dailyData.sort((a, b) => a.fullDate - b.fullDate);
        
        setCalorieData(dailyData);
      } catch (err) {
        console.error("Failed to fetch calorie trend data:", err);
        setError("无法加载卡路里趋势数据");
      } finally {
        setLoading(false);
      }
    };

    fetchCalorieData();
  }, []);

  // 计算合适的Y轴范围
// 计算合适的Y轴范围
const getYAxisDomain = () => {
  if (calorieData.length === 0) return [0, goalCalories * 1.2];
  
  const maxCalories = Math.max(
    Math.max(...calorieData.map(d => d.calories)), 
    goalCalories
  );
  
  // 上限设为最大值的1.2倍，确保柱子和目标线都能完整显示
  return [0, Math.ceil(maxCalories * 1.2)];
};

  return (
    <div className="card">
      <div className="card-header">
        <h3>Calorie Trend</h3>
      </div>
      
      {error && (
        <div className="error-message" style={{
          padding: '10px',
          margin: '0 10px 10px',
          backgroundColor: '#fff0f0',
          borderRadius: '5px',
          color: '#d32f2f',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      <div className="chart-container">
        {loading ? (
          <div className="loading-state">Loading data...</div>
        ) : calorieData.length > 0 && calorieData.some(d => d.calories > 0) ? (
          <ResponsiveContainer>
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={getYAxisDomain()} />
              <Tooltip 
                formatter={(value) => [`${value} kcal`, 'Calories']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              {/* 添加目标线 */}
              <ReferenceLine 
                y={goalCalories} 
                stroke="red" 
                strokeDasharray="3 3" 
                // label={{
                //   position: 'insideTopRight', 
                //   value: `Goal: ${goalCalories}`, 
                //   fill: 'red'
                // }} 
              />
              <Bar 
                dataKey="calories" 
                fill="#82ca9d" 
                name="Calories" 
                radius={[4, 4, 0, 0]} // 设置柱状图顶部为圆角
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            No calorie data available for the past 7 days.
          </div>
        )}
      </div>
    </div>
  );
};

export default CalorieTrendChart;