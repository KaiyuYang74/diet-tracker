// frontend/src/api/food.js
import axios from "axios";

const BASE_URL = "http://localhost:8080/api/food";

// 添加认证头到请求
const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // 使用与Login.jsx相同的key
  if (!token) {
    console.warn("No authentication token found");
    // 可以这里处理重定向到登录
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 将后端Food对象适配为前端需要的格式
const adaptFoodData = (food) => {
  console.log("Adapting food data:", food);
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

export const foodAPI = {
  // 获取所有食物
  getAllFoods: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/all`, {
        headers: getAuthHeader()
      });
      return response.data.map(adaptFoodData);
    } catch (error) {
      console.error("Error fetching foods:", error);
      throw error;
    }
  },
  
  // 搜索食物
  searchFoods: async (query) => {
    try {
      const response = await axios.get(`${BASE_URL}/search?query=${query}`, {
        headers: getAuthHeader()
      });
      return response.data.map(adaptFoodData);
    } catch (error) {
      console.error("Error searching foods:", error);
      throw error;
    }
  },
  
  // 获取单个食物详情
  getFoodById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: getAuthHeader()
      });
      return adaptFoodData(response.data);
    } catch (error) {
      console.error(`Error fetching food with id ${id}:`, error);
      throw error;
    }
  }
};