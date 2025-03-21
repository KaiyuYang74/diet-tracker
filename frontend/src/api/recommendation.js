// frontend/src/api/recommendation.js
import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";

// 添加认证头到请求
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No authentication token found");
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const recommendationAPI = {
  // 获取餐食推荐
  getMealRecommendation: async (userData, type = "loss") => {
    try {
      const response = await axios.post(`${BASE_URL}/recommend`, {
        weight: userData.weight,
        height: userData.height,
        age: userData.age,
        type: type
      }, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching meal recommendations:", error);
      throw error;
    }
  },
  
  // 简化版本，不需要完整用户数据，只需要推荐类型
  getQuickRecommendation: async (type = "loss") => {
    try {
      // 使用默认值，适合快速获取推荐而不需要完整用户数据的场景
      const response = await axios.post(`${BASE_URL}/recommend`, {
        weight: 70, // 默认体重
        height: 170, // 默认身高  
        age: 30, // 默认年龄
        type: type
      }, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching quick recommendations:", error);
      throw error;
    }
  }
};