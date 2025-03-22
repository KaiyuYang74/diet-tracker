import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import MealDistributionChart from './MealDistributionChart';
import FoodItem from './FoodItem';
import { recommendationAPI } from '../../api/recommendation';
import { STORAGE_KEY, processMealData, initialMealData, MEAL_ORDER } from '../constants';
import api from '../../api/axiosConfig'; // 添加API导入
import '../../styles/components/recommendations/RecommendationsCard.css';

const RecommendationsCard = ({ userId }) => {
  // 状态管理
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [recommendedFood, setRecommendedFood] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationType, setRecommendationType] = useState("loss");
  const [mealData, setMealData] = useState(initialMealData);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loadingInitialRecommendation, setLoadingInitialRecommendation] = useState(false);
  
  // 数据处理
  const processedMealData = processMealData(mealData);
  const totalCalories = mealData.reduce((sum, item) => sum + item.value, 0);

  // 从后端获取用户目标类型
  const fetchUserGoalType = async (uid) => {
    if (!uid) return;
    
    try {
      // 从用户API获取目标类型
      const response = await api.get(`/users/${uid}`);
      const userData = response.data;
      
      // 如果用户有目标类型，使用它；否则使用localStorage或默认值
      if (userData && userData.goalType) {
        console.log(`Retrieved user goal from backend: ${userData.goalType}`);
        setRecommendationType(userData.goalType);
        // 更新localStorage，保持一致性
        localStorage.setItem("userGoal", userData.goalType);
      } else {
        // 回退到localStorage或默认值
        const localGoal = localStorage.getItem("userGoal") || "loss";
        console.log(`Using local goal type: ${localGoal} (backend data not available)`);
        setRecommendationType(localGoal);
      }
    } catch (error) {
      console.error("Failed to fetch user goal type:", error);
      // 回退到localStorage或默认值
      const localGoal = localStorage.getItem("userGoal") || "loss";
      console.log(`Using local goal type: ${localGoal} (after error)`);
      setRecommendationType(localGoal);
    }
  };

  // 用户变更时清除本地存储
  useEffect(() => {
    // 获取上次保存的用户ID
    const savedUserId = localStorage.getItem(STORAGE_KEY.USER_ID);
    
    // 如果用户ID变更，清除所有推荐相关的本地存储
    if (savedUserId !== userId) {
      localStorage.removeItem(STORAGE_KEY.RECOMMENDATIONS);
      localStorage.removeItem(STORAGE_KEY.SHOW_RECOMMENDATIONS);
      localStorage.removeItem(STORAGE_KEY.SELECTED_MEAL);
      localStorage.removeItem(STORAGE_KEY.MEAL_DATA);
      
      // 保存新的用户ID
      localStorage.setItem(STORAGE_KEY.USER_ID, userId);
      
      // 重置状态
      setShowRecommendations(false);
      setSelectedMeal(null);
      setRecommendedFood(null);
      setRecommendations(null);
      setMealData(initialMealData);
    } 
    
    // 获取用户目标类型 - 无论是否为新用户都获取
    fetchUserGoalType(userId);
    
    // 用户ID相同，尝试从localStorage中恢复状态
    if (savedUserId === userId) {
      initializeFromLocalStorage();
    }
  }, [userId]);

  // 从localStorage恢复状态
  const initializeFromLocalStorage = () => {
    // 获取用户设置的目标类型
    const userGoal = localStorage.getItem("userGoal") || "loss";
    setRecommendationType(userGoal);
    
    // 尝试从localStorage中恢复状态
    const savedShowRecommendations = localStorage.getItem(STORAGE_KEY.SHOW_RECOMMENDATIONS);
    const savedMealData = localStorage.getItem(STORAGE_KEY.MEAL_DATA);
    const savedRecommendations = localStorage.getItem(STORAGE_KEY.RECOMMENDATIONS);
    const savedSelectedMeal = localStorage.getItem(STORAGE_KEY.SELECTED_MEAL);
    
    if (savedShowRecommendations === "true") {
      // 如果之前已经显示推荐，恢复状态
      setShowRecommendations(true);
      
      if (savedMealData) {
        const parsedMealData = JSON.parse(savedMealData);
        setMealData(parsedMealData);
      }
      
      if (savedRecommendations) {
        const parsedRecommendations = JSON.parse(savedRecommendations);
        setRecommendations(parsedRecommendations);
      }
      
      if (savedSelectedMeal) {
        // 恢复选中的餐次
        const parsedSelectedMeal = JSON.parse(savedSelectedMeal);
        setSelectedMeal(parsedSelectedMeal);
        
        // 如果有推荐数据，同时恢复推荐食物
        if (savedRecommendations) {
          const parsedRecommendations = JSON.parse(savedRecommendations);
          const mealKey = parsedSelectedMeal.name.toLowerCase();
          setRecommendedFood(parsedRecommendations[mealKey] || []);
        }
      }
    }
  };

  // 保存状态到localStorage
  useEffect(() => {
    if (showRecommendations) {
      localStorage.setItem(STORAGE_KEY.SHOW_RECOMMENDATIONS, "true");
      localStorage.setItem(STORAGE_KEY.MEAL_DATA, JSON.stringify(mealData));
      
      if (recommendations) {
        localStorage.setItem(STORAGE_KEY.RECOMMENDATIONS, JSON.stringify(recommendations));
      }
      
      if (selectedMeal) {
        localStorage.setItem(STORAGE_KEY.SELECTED_MEAL, JSON.stringify(selectedMeal));
      } else {
        localStorage.removeItem(STORAGE_KEY.SELECTED_MEAL);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY.SHOW_RECOMMENDATIONS);
    }
  }, [showRecommendations, mealData, recommendations, selectedMeal]);

  // 处理推荐按钮点击
  const handleEnlightenMe = async () => {
    if (loadingInitialRecommendation || showRecommendations) return;
    
    setLoadingInitialRecommendation(true);
    try {
      const data = await loadRecommendations(recommendationType);
      setShowRecommendations(true);
      
      // 等待下一个渲染周期，确保 mealData 已更新
      setTimeout(() => {
        // 自动选择早餐区块
        const updatedProcessedData = processMealData(mealData);
        const breakfastItem = updatedProcessedData.find(item => item.name === "Breakfast");
        if (breakfastItem) {
          handleMealSelect(breakfastItem, true);
        }
      }, 0);
    } catch (error) {
      console.error("Failed to load initial recommendations:", error);
    } finally {
      setLoadingInitialRecommendation(false);
    }
  };

  // 加载推荐食物
  const loadRecommendations = async (type) => {
    setLoadingRecommendations(true);
    try {
      const data = await recommendationAPI.getQuickRecommendation(type);
      setRecommendations(data);
      
      // 更新饼图数据，按固定顺序处理
      const updatedMealData = MEAL_ORDER.map(mealName => ({
        name: mealName,
        value: data[mealName.toLowerCase()] 
          ? data[mealName.toLowerCase()].length * (
              mealName === 'Breakfast' ? 150 : 
              mealName === 'Lunch' ? 200 : 
              180
            )
          : (
              mealName === 'Breakfast' ? 400 :
              mealName === 'Lunch' ? 600 : 
              500
            )
      }));

      setMealData(updatedMealData);
      
      // 如果当前有选中的餐次，立即显示对应的推荐
      if (selectedMeal) {
        const mealKey = selectedMeal.name.toLowerCase();
        setRecommendedFood(data[mealKey] || []);
      }
      
      return data;
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      return null;
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // 处理食物推荐
  const handleMealSelect = (selectedItem, forceSelect = false) => {
    // 只有在启用推荐后才能选择餐次
    if (!showRecommendations) return;

    // 检查是否是取消选择 - 只有在非强制选择的情况下才检查
    const isDeselecting = !forceSelect && selectedMeal && selectedMeal.name === selectedItem.name;
    
    // 强制选择或普通选择逻辑
    if (forceSelect || !isDeselecting) {
      setSelectedMeal(selectedItem);
      
      if (recommendations) {
        // 将餐次名称转换为API响应的格式
        const mealKey = selectedItem.name.toLowerCase();
        setRecommendedFood(recommendations[mealKey] || []);
      }
    }
    // 不再支持取消选择逻辑，保持选中状态
  };

  // 刷新推荐
  const handleRefreshRecommendation = async () => {
    if (selectedMeal) {
      const newData = await loadRecommendations(recommendationType);
      if (newData && selectedMeal) {
        const mealKey = selectedMeal.name.toLowerCase();
        setRecommendedFood(newData[mealKey] || []);
      }
    }
  };

  return (
    <div className="card intake-recommendation-card">
      <div className="card-header">
        <h3>AI Recommendations</h3>
        {selectedMeal && showRecommendations && (
          <button 
            className="refresh-recommendation-btn"
            onClick={handleRefreshRecommendation}
            disabled={loadingRecommendations}
          >
            <RefreshCw size={16} className={loadingRecommendations ? "loading" : ""} />
          </button>
        )}
      </div>
      <div className="donut-container">
        <MealDistributionChart 
          data={processedMealData}
          selected={selectedMeal}
          hoveredIndex={hoveredIndex}
          onSelect={handleMealSelect}
          onHover={setHoveredIndex}
          totalCalories={totalCalories}
          showRecommendations={showRecommendations}
          onEnlightenMe={handleEnlightenMe}
          loadingRecommendation={loadingInitialRecommendation}
        />
      </div>
      
      {selectedMeal && recommendedFood && (
        <div className="recommendation-divider"></div>
      )}
      
      {!selectedMeal && !showRecommendations ? (
        <div className="recommendation-placeholder">
          Food recommendations will appear here
        </div>
      ) : (
        <div className="recommendation-content">
          {loadingRecommendations ? (
            <div className="loading-recommendations">Loading...</div>
          ) : selectedMeal && recommendedFood && recommendedFood.length > 0 ? (
            recommendedFood.map((food, index) => (
              <FoodItem key={index} food={food} />
            ))
          ) : (
            <div className="no-recommendation">No recommendations available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationsCard;