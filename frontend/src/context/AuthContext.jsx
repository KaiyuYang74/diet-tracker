import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig'; // 导入配置好的axios实例
import { STORAGE_KEY } from '../components/constants'; // 导入存储键常量

// 创建上下文
const AuthContext = createContext();

// 认证提供者组件
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY.TOKEN));
  const [loading, setLoading] = useState(true);

  // 初始化 - 从localStorage加载用户状态
  useEffect(() => {
    const userId = localStorage.getItem(STORAGE_KEY.USER_ID);
    const storedToken = localStorage.getItem(STORAGE_KEY.TOKEN);
    
    if (userId && storedToken) {
      setCurrentUser({ id: userId });
      setToken(storedToken);
      
      // 尝试加载用户的完整信息，包括目标类型
      loadUserDetails(userId);
    }
    
    setLoading(false);
  }, []);
  
  // 加载用户详细信息
  const loadUserDetails = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      const userData = response.data;
      
      // 扩展currentUser对象，包含更多用户数据
      setCurrentUser(prev => ({
        ...prev,
        ...userData,
        id: userId // 确保ID保持一致
      }));
      
      // 如果用户有目标类型，更新localStorage
      if (userData.goalType) {
        localStorage.setItem(STORAGE_KEY.USER_GOAL, userData.goalType);
      }
    } catch (error) {
      console.error("Failed to load user details:", error);
      // 即使加载失败，也保持用户登录状态
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
        
        // 存储令牌和用户ID
        const trimmedToken = newToken.trim();
        const trimmedUserId = userId.trim();
        
        localStorage.setItem(STORAGE_KEY.TOKEN, trimmedToken);
        localStorage.setItem(STORAGE_KEY.USER_ID, trimmedUserId);
        
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
          
          // 存储用户ID
          localStorage.setItem(STORAGE_KEY.USER_ID, userId);
          
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
              
              // 存储令牌和用户ID
              const trimmedToken = newToken.trim();
              
              localStorage.setItem(STORAGE_KEY.TOKEN, trimmedToken);
              
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
    // 清除认证相关localStorage数据
    localStorage.removeItem(STORAGE_KEY.TOKEN);
    localStorage.removeItem(STORAGE_KEY.USER_ID);
    
    // 清除用户目标和推荐相关的localStorage数据
    localStorage.removeItem(STORAGE_KEY.USER_GOAL);
    localStorage.removeItem(STORAGE_KEY.RECOMMENDATIONS);
    localStorage.removeItem(STORAGE_KEY.SHOW_RECOMMENDATIONS);
    localStorage.removeItem(STORAGE_KEY.SELECTED_MEAL);
    localStorage.removeItem(STORAGE_KEY.MEAL_DATA);
    
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
      
      // 更新localStorage
      localStorage.setItem(STORAGE_KEY.USER_GOAL, goalType);
      
      return true;
    } catch (error) {
      console.error("Failed to update user goal:", error);
      return false;
    }
  };

  // 提供上下文值
  const value = {
    currentUser,
    token,
    loading,
    login,
    logout,
    register,
    updateUserGoal, // 新增：更新用户目标类型的方法
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