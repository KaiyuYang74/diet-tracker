import React, { useState, useEffect } from "react";
import BaseLayout from "../layouts/BaseLayout";
import CaloriesCard from "../components/calories/CaloriesCard";
import RecommendationsCard from "../components/recommendations/RecommendationsCard";
import CalorieTrendChart from "../components/charts/CalorieTrendChart";
import WeightChangeChart from "../components/charts/WeightChangeChart";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import "../styles/theme.css";
import "../styles/pages/Home.css";

function Home() {
  // 全局状态
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [goalCalories, setGoalCalories] = useState(2000);
  const [exerciseCalories, setExerciseCalories] = useState(0);
  const [remainingCalories, setRemainingCalories] = useState(0);
  const [calorieTrendData, setCalorieTrendData] = useState([]);
  const { currentUser } = useAuth(); 
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 加载用户数据
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.id) {
        try {
          setLoading(true);
          const response = await api.get(`/users/${currentUser.id}`);
          setUserData(response.data);

          // 计算目标卡路里
          const userWeight = response.data.weight || 70; // 默认体重70kg
          const userHeight = response.data.height || 170; // 默认身高170cm
          const userAge = response.data.age || 30; // 默认年龄30
          const goalType = response.data.goalType || 'loss'; // 默认目标类型

          // 计算BMR (基础代谢率 - Mifflin-St Jeor公式)
          const bmr = (10 * userWeight) + (6.25 * userHeight) - (5 * userAge) + 5;

          // 计算TDEE (总能量消耗 - 活动系数1.55)
          const tdee = bmr * 1.55;

          // 根据目标类型调整卡路里目标
          let calculatedGoalCalories;
          switch(goalType) {
            case 'loss':
              calculatedGoalCalories = Math.round(tdee - 500); // 减重目标
              break;
            case 'gain':
              calculatedGoalCalories = Math.round(tdee + 300); // 增重目标
              break;
            case 'muscle':
              calculatedGoalCalories = Math.round(tdee); // 增肌目标
              break;
            default:
              calculatedGoalCalories = Math.round(tdee);
          }

          console.log("计算的目标卡路里:", calculatedGoalCalories, "基于:", {weight: userWeight, height: userHeight, age: userAge, goal: goalType});
          setGoalCalories(calculatedGoalCalories);

          // 使用计算出的目标卡路里加载今日卡路里摄入
          await fetchTodayCalories(calculatedGoalCalories);

        } catch (err) {
          console.error("Failed to fetch user data:", err);
          setError("无法加载用户数据，请稍后重试");
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchTodayCalories = async (calculatedGoal) => {
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

        // 使用传入的计算目标或状态中的目标卡路里
        const calcGoal = calculatedGoal || goalCalories;
        // 计算剩余卡路里
        const remaining = calcGoal - foodCalories + burnedCalories;
        console.log("计算剩余卡路里:", remaining, "基于:", {goal: calcGoal, food: foodCalories, exercise: burnedCalories});
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
          <CalorieTrendChart goalCalories={goalCalories} />

          {/* 体重变化图 */}
          <WeightChangeChart />
        </div>
      </div>
    </BaseLayout>
  );
}

export default Home;