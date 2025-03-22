// 修改后的exercise.js
import { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from './axiosConfig';

export function useExerciseAPI() {
  const { token } = useAuth(); // 只需获取token用于调试日志
  const userId = localStorage.getItem('userId'); // 直接从localStorage获取userId
  
  // 使用useRef确保返回稳定的API对象引用
  const apiRef = useRef({
    // 添加运动记录
    addExerciseInput: async (exerciseInput) => {
      try {
        // 确保使用当前登录用户的ID
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        // 创建一个新对象，确保使用正确的用户ID
        const dataToSend = {
          ...exerciseInput,
          userId: userId, // 使用从localStorage获取的userId
          date: typeof exerciseInput.date === 'string' 
            ? exerciseInput.date 
            : `${exerciseInput.date.getFullYear()}-${String(exerciseInput.date.getMonth() + 1).padStart(2, '0')}-${String(exerciseInput.date.getDate()).padStart(2, '0')}`
        };
        
        console.log("Sending exercise input data:", dataToSend);
        
        const response = await api.post('/exercise/input', dataToSend);
        return response.data;
      } catch (error) {
        console.error('Error adding exercise input:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    },

    // 获取用户特定日期的运动记录
    getUserExerciseByDate: async (date) => {
      try {
        console.log(`Fetching exercise data for date: ${date}`);
        
        // 确保使用当前登录用户的ID - 每次调用时直接从localStorage获取最新的userId
        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        console.log(`Making API request to: /exercise/input with userId=${currentUserId}, date=${date}`);
        
        const response = await api.get('/exercise/input', {
          params: { userId: currentUserId, date }
        });
        
        console.log("Exercise API response:", response);
        return response.data;
      } catch (error) {
        console.error('Error fetching user exercise:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }
    },

    // 删除一条运动记录
    deleteExerciseInput: async (exerciseId) => {
      try {
        const response = await api.delete(`/exercise/input/${exerciseId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting exercise input:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    }
  });
  
  // 添加额外的调试日志，检查token和userId
  useEffect(() => {
    console.log("Current userId in exerciseAPI:", userId);
    console.log("Current token available:", !!token);
  }, [userId, token]);
  
  return apiRef.current;
}