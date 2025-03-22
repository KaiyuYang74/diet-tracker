// src/api/dietInput.js
import { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from './axiosConfig'; // 导入配置好的axios实例

// dietInput API 钩子
export function useDietInputAPI() {
  const { token } = useAuth(); // 从认证上下文获取token
  const userId = localStorage.getItem('userId'); // 获取用户ID
  
  // 使用 useRef 确保返回稳定的API对象引用
  const apiRef = useRef({
    // 添加日常饮食记录
    addDietInput: async (dietInput) => {
      try {
        // 确保使用当前登录用户的ID
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        // 创建一个新对象，确保使用正确的用户ID
        const dataToSend = {
          ...dietInput,
          userId: userId,
          date: typeof dietInput.date === 'string' 
            ? dietInput.date 
            : `${dietInput.date.getFullYear()}-${String(dietInput.date.getMonth() + 1).padStart(2, '0')}-${String(dietInput.date.getDate()).padStart(2, '0')}`
        };
        
        console.log("Sending diet input data:", dataToSend);
        
        // 注意这里使用的路径 - 不要再加 /api 前缀，因为 axiosConfig 中已经配置了
        const response = await api.post('/diet/input', dataToSend);
        return response.data;
      } catch (error) {
        console.error('Error adding diet input:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    },

    // 获取用户特定日期的饮食记录
    getUserDietByDate: async (date) => {
      try {
        console.log(`Fetching diet data for date: ${date}`);
        
        // 确保使用当前登录用户的ID
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        console.log(`Making API request to: /diet/input with userId=${userId}, date=${date}`);
        
        // 注意这里使用的路径 - 不要再加 /api 前缀
        const response = await api.get('/diet/input', {
          params: { userId, date }
        });
        
        console.log("API response:", response);
        return response.data;
      } catch (error) {
        console.error('Error fetching user diet:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }
    },

    // 删除一条饮食记录
    deleteDietInput: async (dietId) => {
      try {
        // 注意这里使用的路径 - 不要再加 /api 前缀
        const response = await api.delete(`/diet/input/${dietId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting diet input:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    }
  });
  
  // 添加额外的调试日志，检查 token 和 userId
  useEffect(() => {
    console.log("Current userId in dietInput API:", userId);
    console.log("Current token available:", !!token);
  }, [userId, token]);
  
  return apiRef.current;
}