/**
 * 认证服务
 * 处理用户登录、登出和会话管理
 */

// 本地存储键
const STORAGE_KEYS = {
    USER_ID: 'currentUserId',
    USER_TOKEN: 'authToken'
  };
  
  // 清除与用户相关的本地存储
  const clearUserData = () => {
    // 清除用户认证数据
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    
    // 清除用户偏好和设置
    localStorage.removeItem('userGoal');
    
    // 清除推荐数据（确保新用户登录时获得全新体验）
    localStorage.removeItem('foodRecommendations');
    localStorage.removeItem('showRecommendations');
    localStorage.removeItem('selectedMeal');
    localStorage.removeItem('mealData');
  };
  
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} - 包含用户ID和token的对象
   */
  const login = async (username, password) => {
    try {
      // 实际应用中，这里应该调用后端API进行认证
      // const response = await api.post('/auth/login', { username, password });
      
      // 模拟登录成功
      const mockUserId = `user-${Math.floor(Math.random() * 1000)}`;
      const mockToken = `token-${Date.now()}`;
      
      // 登录前先清除之前用户的数据
      clearUserData();
      
      // 保存新用户的认证信息
      localStorage.setItem(STORAGE_KEYS.USER_ID, mockUserId);
      localStorage.setItem(STORAGE_KEYS.USER_TOKEN, mockToken);
      
      return {
        userId: mockUserId,
        token: mockToken
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Authentication failed. Please check your credentials.');
    }
  };
  
  /**
   * 用户登出
   */
  const logout = () => {
    clearUserData();
    // 在实际应用中，可能还需要调用后端API使token失效
    // await api.post('/auth/logout');
  };
  
  /**
   * 获取当前登录用户
   * @returns {Promise<string|null>} - 用户ID或null（如果未登录）
   */
  const getCurrentUser = async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    
    if (!userId || !token) {
      return null;
    }
    
    // 实际应用中，可能需要验证token是否有效
    // try {
    //   await api.get('/auth/verify');
    //   return userId;
    // } catch (error) {
    //   clearUserData();
    //   return null;
    // }
    
    return userId;
  };
  
  /**
   * 检查用户是否已登录
   * @returns {Promise<boolean>} - 是否已登录
   */
  const isAuthenticated = async () => {
    const userId = await getCurrentUser();
    return userId !== null;
  };
  
  export const authService = {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    clearUserData
  };