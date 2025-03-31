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
  // 更新版本使用用户实际数据而不是固定值
  getQuickRecommendation: async (type = "loss") => {
    try {
      // 从localStorage获取用户ID
      const userId = localStorage.getItem("userId");
      let userData = {
        weight: 70, // 默认体重
        height: 170, // 默认身高
        age: 30 // 默认年龄
      };

      // 如果有用户ID，尝试获取用户数据
      if (userId) {
        try {
          const token = localStorage.getItem("token");
          const userResponse = await axios.get(`${BASE_URL}/users/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });

          // 更新用户数据
          if (userResponse.data) {
            userData = {
              weight: userResponse.data.weight || 70,
              height: userResponse.data.height || 170,
              age: userResponse.data.age || 30
            };
          }
        } catch (userError) {
          console.warn("无法获取用户数据进行推荐:", userError);
          // 继续使用默认值
        }
      }

      console.log("请求推荐使用用户数据:", userData, "和目标类型:", type);

      // 发送带有用户数据的推荐请求
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
      console.error("获取快速推荐失败:", error);
      throw error;
    }
  }
};
