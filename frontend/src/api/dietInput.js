// frontend/src/api/dietInput.js
import axios from 'axios';

// 使用一致的URL构建方式
const BASE_URL = "http://localhost:8080/api/diet/input";

// 添加认证头到请求
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No authentication token found");
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 从localStorage获取用户ID
const getUserId = () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("No user ID found in localStorage");
    return null;
  }
  return userId;
};

export const dietInputAPI = {
  // 添加日常饮食记录
  addDietInput: async (dietInput) => {
    try {
      // 确保使用当前登录用户的ID
      const userId = getUserId();
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }
      
      // 创建一个新对象，确保使用正确的用户ID
      const dataToSend = {
        ...dietInput,
        userId: userId
      };
      
      console.log("Sending diet input data:", dataToSend);
      
      const response = await axios.post(BASE_URL, dataToSend, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding diet input:', error);
      throw error;
    }
  },

  // 获取用户特定日期的饮食记录
  getUserDietByDate: async (date) => {
    try {
      // 确保使用当前登录用户的ID
      const userId = getUserId();
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }
      
      console.log(`Fetching diet data for user: ${userId}, date: ${date}`);
      
      const response = await axios.get(BASE_URL, {
        params: { userId, date },
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user diet:', error);
      throw error;
    }
  },

  // 删除一条饮食记录
  deleteDietInput: async (dietId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${dietId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting diet input:', error);
      throw error;
    }
  }
};