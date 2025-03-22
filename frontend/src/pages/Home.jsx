import React, { useState, useEffect } from "react";
import BaseLayout from "../layouts/BaseLayout";
import CaloriesCard from "../components/calories/CaloriesCard";
import RecommendationsCard from "../components/recommendations/RecommendationsCard";
import CalorieTrendChart from "../components/charts/CalorieTrendChart";
import WeightChangeChart from "../components/charts/WeightChangeChart";
import { trendData, weightData } from "../components/constants";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig"; // 导入配置好的axios实例
import "../styles/theme.css";
import "../styles/pages/Home.css";

function Home() {
  // 全局状态
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [goalCalories, setGoalCalories] = useState(2000);
  const [exerciseCalories, setExerciseCalories] = useState(0);
  const [remainingCalories, setRemainingCalories] = useState(0);
  const { currentUser } = useAuth(); // 从认证上下文获取当前用户
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 加载用户数据
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.id) {
        try {
          setLoading(true);
          // 修改: 使用api实例，并且简化路径(不需要包含完整URL)
          const response = await api.get(`/users/${currentUser.id}`);
          setUserData(response.data);
          
          // 如果API返回了目标卡路里，更新状态
          if (response.data.goalCalories) {
            setGoalCalories(response.data.goalCalories);
          }
          
          // 加载今日卡路里摄入
          await fetchTodayCalories();
          
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          setError("无法加载用户数据，请稍后重试");
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchTodayCalories = async () => {
      try {
        // 获取今日日期
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // 获取饮食数据
        const dietResponse = await api.get(`/diet/input`, {
          params: { userId: currentUser.id, date: formattedDate }
        });
        
        // 计算今日总卡路里摄入
        let foodCalories = 0;
        if (dietResponse.data && Array.isArray(dietResponse.data)) {
          foodCalories = dietResponse.data.reduce((sum, item) => sum + item.calories, 0);
          setCaloriesToday(foodCalories);
        } else {
          setCaloriesToday(0);
        }
        
        // 获取运动数据
        const exerciseResponse = await api.get(`/exercise/input`, {
          params: { userId: currentUser.id, date: formattedDate }
        });
        
        // 计算今日运动消耗
        let burnedCalories = 0;
        if (exerciseResponse.data && Array.isArray(exerciseResponse.data)) {
          burnedCalories = exerciseResponse.data.reduce((sum, item) => sum + item.calories, 0);
          setExerciseCalories(burnedCalories);
        } else {
          setExerciseCalories(0);
        }

        // 计算剩余卡路里
        const remaining = goalCalories - foodCalories + burnedCalories;
        setRemainingCalories(remaining);
      } catch (err) {
        console.error("Failed to fetch daily data:", err);
        setCaloriesToday(0);
        setExerciseCalories(0);
        setRemainingCalories(goalCalories);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // 显示加载中状态
  if (loading) {
    return (
      <BaseLayout>
        <div className="page-container">
          <div className="loading-state">加载中...</div>
        </div>
      </BaseLayout>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <BaseLayout>
        <div className="page-container">
          <div className="error-state">{error}</div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="page-container">
        <div className="grid-layout">
          {/* 今日卡路里卡片 */}
          <CaloriesCard 
            caloriesToday={caloriesToday}
            goalCalories={goalCalories}
            exerciseCalories={exerciseCalories}
            remainingCalories={remainingCalories}
          />

          {/* AI推荐 */}
          {currentUser && <RecommendationsCard userId={currentUser.id} />}

          {/* 卡路里趋势图 */}
          <CalorieTrendChart data={trendData} />

          {/* 体重变化图 */}
          <WeightChangeChart />
        </div>
      </div>
    </BaseLayout>
  );
}

export default Home;