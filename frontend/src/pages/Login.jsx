import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import "../styles/pages/Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 使用 useState 管理表单数据
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  
  // 错误消息
  const [error, setError] = useState("");

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
    
    setLoading(true);
    setError("");

    try {
      const success = await login(formData.username, formData.password);
      
      if (success) {
        navigate("/home");
      } else {
        setError("登录失败，请检查用户名和密码");
      }
    } catch (error) {
      console.error("登录请求失败:", error);
      setError("登录请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="auth-container bg-login">
        <div className="auth-box">
          <h1>Login</h1>
          
          {error && (
            <div className="auth-error" style={{
              color: '#d32f2f',
              backgroundColor: '#ffebee',
              padding: '10px',
              borderRadius: '10px',
              marginBottom: '15px'
            }}>
              {error}
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              className="auth-input"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <button 
              type="submit" 
              className="auth-btn"
              disabled={loading}
            >
              {loading ? "登录中..." : "Login"}
            </button>
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