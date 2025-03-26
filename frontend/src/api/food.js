// src/api/food.js - 修改
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import api from './axiosConfig'; // 添加这行导入配置好的axios实例

// 将后端Food对象适配为前端需要的格式
const adaptFoodData = (food) => {
  return {
    id: food.id,
    name: food.food,
    calories: food.caloricValue,
    protein: food.protein,
    fat: food.fat,
    carbs: food.carbohydrates,
    servingSize: "100g",
  };
};

// 创建钩子函数，返回API方法集合
export const useFoodAPI = () => {
  const { getAuthHeader } = useAuth();
  
  return {
    // 获取所有食物
    getAllFoods: async () => {
      try {
        // 使用设置好的api实例，简化URL
        const response = await api.get("/food/all");
        return response.data.map(adaptFoodData);
      } catch (error) {
        console.error("Error fetching foods:", error);
        throw error;
      }
    },
    
    // 搜索食物 - 修改为使用正确的接口
    searchFoods: async (query) => {
      try {
        console.log(`Searching foods with query: ${query}`);
        
        // 尝试使用正确的搜索接口
        const response = await api.get("/food/search", {
          params: { query } // 使用params对象传递查询参数
        });
        
        console.log("Search API response:", response);
        
        // 如果是空数组则直接返回
        if (!response.data || !Array.isArray(response.data)) {
          console.warn("API returned non-array data:", response.data);
          return [];
        }
        
        return response.data.map(adaptFoodData);
      } catch (error) {
        console.error("Error searching foods:", error);
        // 增强错误日志
        if (error.response) {
          console.error("Error status:", error.response.status);
          console.error("Error data:", error.response.data);
        }
        throw error;
      }
    },
    
    // 获取单个食物详情
    getFoodById: async (id) => {
      try {
        const response = await api.get(`/food/${id}`);
        return adaptFoodData(response.data);
      } catch (error) {
        console.error(`Error fetching food with id ${id}:`, error);
        throw error;
      }
    }
  };
};
