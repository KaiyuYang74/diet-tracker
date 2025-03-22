import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig'; // 导入配置好的axios实例

// 定义存储键
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId'
};

// 创建上下文
const AuthContext = createContext();

// 认证提供者组件
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [loading, setLoading] = useState(true);

  // 初始化 - 从localStorage加载用户状态
  useEffect(() => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (userId && storedToken) {
      setCurrentUser({ id: userId });
      setToken(storedToken);
    }
    
    setLoading(false);
  }, []);

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
        
        localStorage.setItem(STORAGE_KEYS.TOKEN, trimmedToken);
        localStorage.setItem(STORAGE_KEYS.USER_ID, trimmedUserId);
        
        setCurrentUser({ id: trimmedUserId });
        setToken(trimmedToken);
        
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
          localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
          setCurrentUser({ id: userId });
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    
    setCurrentUser(null);
    setToken(null);
  };

  // 提供上下文值
  const value = {
    currentUser,
    token,
    loading,
    login,
    logout,
    register,
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