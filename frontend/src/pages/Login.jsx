import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/auth.css";
import "../styles/pages/Login.css";

function Login() {
  const navigate = useNavigate();

  // 使用 useState 管理表单数据
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  // 处理输入框的 onChange 事件
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // 处理表单提交事件
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      // 向后端发送POST请求
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          username: formData.username, 
          password: formData.password
        }
      );

      const data = response.data;
      console.log("Login response data:", data);

      if (data.startsWith("login successfully!")) {
        const token = data.replace("login successfully!", "");
        localStorage.setItem("token", token);

        navigate("/home");
      } else {
        alert(data);
      }
    } catch (error) {
      console.error("登录请求失败:", error);
      alert("登录请求失败，请查看控制台。");
    }
  };

  return (
    <BaseLayout>
      <div className="auth-container bg-login">
        <div className="auth-box">
          <h1>Login</h1>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              className="auth-input"
              value={formData.username}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <button type="submit" className="auth-btn">Login</button>
          </form>
          <p className="auth-link">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Login;
