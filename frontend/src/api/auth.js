// import axios from "axios";

// const API_URL = "http://localhost:8080/api/auth";

// /**
//  * 注册新用户
//  * @param {Object} userData 包含注册所需数据，例如 { username, email, password }
//  * @returns {Promise<String>} 返回注册结果消息
//  */
// export const register = async (userData) => {
//     try {
//         const response = await axios.post(`${API_URL}/register`, userData);
//         return response.data;
//     } catch (error) {
//         console.error("注册用户失败:", error);
//         throw error;
//     }
// };

// /**
//  * 用户登录接口
//  * @param {Object} userData 包含登录所需数据，例如 { username, password }
//  * @returns {Promise<String>} 返回登录结果消息或者Token
//  */
// export const login = async (userData) => {
//     try {
//         const response = await axios.post(`${API_URL}/login`, userData);
//         return response.data;
//     } catch (error) {
//         console.error("用户登录失败:", error);
//         throw error;
//     }
// };
