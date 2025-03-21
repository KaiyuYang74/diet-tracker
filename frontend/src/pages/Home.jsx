import React, { useState, useEffect } from "react";
import BaseLayout from "../layouts/BaseLayout";
import CaloriesCard from "../components/calories/CaloriesCard";
import RecommendationsCard from "../components/recommendations/RecommendationsCard";
import CalorieTrendChart from "../components/charts/CalorieTrendChart";
import WeightChangeChart from "../components/charts/WeightChangeChart";
import { trendData, weightData } from "../components/constants";
import "../styles/theme.css";
import "../styles/pages/Home.css";

function Home() {
  // 全局状态
  const [caloriesToday, setCaloriesToday] = useState(1700);
  const [goalCalories, setGoalCalories] = useState(2000);
  const [exerciseCalories, setExerciseCalories] = useState(0);
  const [userId, setUserId] = useState(null);
  
  // 初始化用户ID - 在实际应用中，这会从身份验证系统或用户会话获取
  useEffect(() => {
    // 从用户会话或API获取当前用户ID
    const getCurrentUser = async () => {
      try {
        // 这里应该是实际的用户认证逻辑
        // 例如：const user = await authService.getCurrentUser();
        // 为示例，我们使用模拟数据
        const mockUserId = localStorage.getItem('currentUserId') || 'user-123';
        setUserId(mockUserId);
      } catch (error) {
        console.error("Failed to get current user:", error);
      }
    };

    getCurrentUser();
  }, []); 

  return (
    <BaseLayout>
      <div className="page-container">
        <div className="grid-layout">
          {/* 今日卡路里卡片 */}
          <CaloriesCard 
            caloriesToday={caloriesToday}
            goalCalories={goalCalories}
            exerciseCalories={exerciseCalories}
          />

          {/* AI推荐 */}
          {userId && <RecommendationsCard userId={userId} />}

          {/* 卡路里趋势图 */}
          <CalorieTrendChart data={trendData} />

          {/* 体重变化图 */}
          <WeightChangeChart data={weightData} />
        </div>
      </div>
    </BaseLayout>
  );
}

export default Home;