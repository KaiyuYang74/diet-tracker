import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig'; // 导入配置好的axios实例

// 定义存储键常量，确保全局一致性
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  USER_GOAL: 'userGoal',
  RECOMMENDATIONS: 'foodRecommendations',
  SHOW_RECOMMENDATIONS: 'showRecommendations',
  SELECTED_MEAL: 'selectedMeal',
  MEAL_DATA: 'mealData'
};

// 创建上下文
const AuthContext = createContext();

// 认证提供者组件
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN));
  const [loading, setLoading] = useState(true);

  // 初始化 - 从localStorage加载用户状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 获取存储的认证信息
        const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        const userId = localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
        
        if (storedToken && userId) {
          console.log("Found stored credentials, restoring session...");
          // 设置基本认证状态
          setToken(storedToken);
          setCurrentUser({ id: userId });
          
          // 尝试加载用户完整信息
          await loadUserDetails(userId);
        } else {
          console.log("No stored credentials found");
          // 确保清除可能存在的部分状态
          setCurrentUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // 发生错误时，确保用户至少有基本登录状态
        const userId = localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
        if (userId) {
          setCurrentUser({ id: userId });
        }
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // 加载用户详细信息
  const loadUserDetails = async (userId) => {
    try {
      console.log(`Loading details for user ID: ${userId}`);
      const response = await api.get(`/users/${userId}`);
      const userData = response.data;
      
      if (userData) {
        console.log("User details loaded successfully");
        // 扩展currentUser对象，包含更多用户数据
        setCurrentUser(prev => ({
          ...prev,
          ...userData,
          id: userId, // 确保ID保持一致
          // 确保dateOfBirth正确处理
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth : null
        }));
        
        // 如果用户有目标类型，更新localStorage
        if (userData.goalType) {
          localStorage.setItem(AUTH_STORAGE_KEYS.USER_GOAL, userData.goalType);
        }
        
        return true;
      } else {
        console.warn("Received empty user data");
        return false;
      }
    } catch (error) {
      console.error("Failed to load user details:", error);
      // 即使加载失败，也保持用户基本登录状态（不清除currentUser）
      return false;
    }
  };

  // 登录函数
  const login = async (username, password) => {
    try {
      // 注意：登录时使用直接的axios，因为此时还没有token
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { username, password }
      );

      const data = response.data;
      
      if (data.includes("login successfully!")) {
        const parts = data.split("login successfully!");
        const tokenAndUserId = parts[1];
        const [newToken, userId] = tokenAndUserId.split("|");
        
        // 存储令牌和用户ID - 使用一致的键名
        const trimmedToken = newToken.trim();
        const trimmedUserId = userId.trim();
        
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, trimmedToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, trimmedUserId);
        
        // 设置基本用户信息
        setCurrentUser({ id: trimmedUserId });
        setToken(trimmedToken);
        
        // 加载完整用户信息
        await loadUserDetails(trimmedUserId);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // 注册函数
  const register = async (userData) => {
    try {
      // 注意：注册时使用直接的axios，因为此时还没有token
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        userData
      );
  
      const data = response.data;
      
      if (data.includes("successfully")) {
        const parts = data.split("|");
        if (parts.length > 1) {
          const userId = parts[1].trim();
          
          // 存储用户ID - 使用一致的键名
          localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, userId);
          
          // 因为后端没有在注册时返回token，我们需要立即进行登录来获取token
          try {
            // 用刚注册的用户名和密码自动登录
            const loginResponse = await axios.post(
              "http://localhost:8080/api/auth/login",
              { 
                username: userData.username,
                password: userData.password
              }
            );
            
            const loginData = loginResponse.data;
            
            if (loginData.includes("login successfully!")) {
              const loginParts = loginData.split("login successfully!");
              const tokenAndUserId = loginParts[1];
              const [newToken, userId] = tokenAndUserId.split("|");
              
              // 存储令牌和用户ID - 使用一致的键名
              const trimmedToken = newToken.trim();
              
              localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, trimmedToken);
              
              // 设置基本用户信息
              setCurrentUser({ id: userId.trim() });
              setToken(trimmedToken);
              
              // 加载完整用户信息
              await loadUserDetails(userId.trim());
            }
          } catch (loginError) {
            console.error("Auto login after registration failed:", loginError);
            // 如果自动登录失败，至少确保用户ID已保存
            setCurrentUser({ id: userId });
          }
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  // 登出函数
  const logout = () => {
    // 清除认证相关localStorage数据 - 使用一致的键名
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_ID);
    
    // 清除用户目标和推荐相关的localStorage数据
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_GOAL);
    localStorage.removeItem(AUTH_STORAGE_KEYS.RECOMMENDATIONS);
    localStorage.removeItem(AUTH_STORAGE_KEYS.SHOW_RECOMMENDATIONS);
    localStorage.removeItem(AUTH_STORAGE_KEYS.SELECTED_MEAL);
    localStorage.removeItem(AUTH_STORAGE_KEYS.MEAL_DATA);
    
    // 重置状态
    setCurrentUser(null);
    setToken(null);
  };

  // 更新用户目标类型
  const updateUserGoal = async (goalType) => {
    if (!currentUser || !currentUser.id) return false;
    
    try {
      // 先尝试使用PATCH方法单独更新目标类型
      try {
        await api.patch(`/users/${currentUser.id}/goal`, { goalType });
      } catch (patchError) {
        // 如果PATCH失败，尝试使用GET+PUT方法
        const userResponse = await api.get(`/users/${currentUser.id}`);
        const userData = userResponse.data;
        
        await api.put(`/users/${currentUser.id}`, {
          ...userData,
          goalType
        });
      }
      
      // 更新本地状态
      setCurrentUser(prev => ({
        ...prev,
        goalType
      }));
      
      // 更新localStorage - 使用一致的键名
      localStorage.setItem(AUTH_STORAGE_KEYS.USER_GOAL, goalType);
      
      return true;
    } catch (error) {
      console.error("Failed to update user goal:", error);
      return false;
    }
  };

  // 更新用户信息
  const updatePassword = async (passwords) => {
    if (!currentUser || !currentUser.id) return false;
    
    try {
      // 获取当前用户数据
      const userResponse = await api.get(`/users/${currentUser.id}`);
      const userData = userResponse.data;

      if (userData.password !== passwords.oldPassword){
        return false;
      }
      userData.password = passwords.newPassword;
      
      // 发送更新请求
      await api.put(`/users/${currentUser.id}`, userData);
      
      // 更新本地状态
      setCurrentUser(prev => ({
        ...prev,
        ...userData
      }));
      setToken(null);
      
      return true;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      return false;
    }
  };
  
  // 检查用户是否已登录
  const checkAuthenticated = () => {
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    const userId = localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
    return !!(storedToken && userId);
  };


  // 提供上下文值
  const value = {
    currentUser,
    token,
    loading,
    login,
    logout,
    register,
    updateUserGoal,
    updatePassword,
    checkAuthenticated,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用钩子
export function useAuth() {
  return useContext(AuthContext);
}