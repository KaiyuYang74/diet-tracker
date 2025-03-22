// src/api/weightRecord.js
import { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from './axiosConfig';

export function useWeightRecordAPI() {
  const { token } = useAuth();
  const userId = localStorage.getItem('userId');
  
  const apiRef = useRef({
    // 添加体重记录
    addWeightRecord: async (weightData) => {
      try {
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        const dataToSend = {
          ...weightData,
          userId: userId,
          date: typeof weightData.date === 'string' 
            ? weightData.date 
            : `${weightData.date.getFullYear()}-${String(weightData.date.getMonth() + 1).padStart(2, '0')}-${String(weightData.date.getDate()).padStart(2, '0')}`
        };
        
        console.log("Sending weight record data:", dataToSend);
        
        const response = await api.post('/weight', dataToSend);
        return response.data;
      } catch (error) {
        console.error('Error adding weight record:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    },

    // 获取所有体重记录
    getAllWeightRecords: async () => {
      try {
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        const response = await api.get('/weight/all', {
          params: { userId }
        });
        
        return response.data;
      } catch (error) {
        console.error('Error fetching all weight records:', error);
        throw error;
      }
    },

    // 获取最近30天的体重记录
    getRecentWeightRecords: async () => {
      try {
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        const response = await api.get('/weight/recent', {
          params: { userId }
        });
        
        return response.data;
      } catch (error) {
        console.error('Error fetching recent weight records:', error);
        throw error;
      }
    },

    // 获取最近n条记录
    getLastNWeightRecords: async (count = 5) => {
      try {
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }
        
        const response = await api.get('/weight/last', {
          params: { userId, count }
        });
        
        return response.data;
      } catch (error) {
        console.error('Error fetching last weight records:', error);
        throw error;
      }
    },

    // 删除体重记录
    deleteWeightRecord: async (recordId) => {
      try {
        const response = await api.delete(`/weight/${recordId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting weight record:', error);
        throw error;
      }
    }
  });
  
  useEffect(() => {
    console.log("Current userId in weightRecord API:", userId);
    console.log("Current token available:", !!token);
  }, [userId, token]);
  
  return apiRef.current;
}