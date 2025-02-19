import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/auth.css";
import "../styles/pages/Register.css";

function Register() {
  const navigate = useNavigate();
  
  // 表单状态管理
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // 处理表单提交
  const handleRegister = (e) => {
    e.preventDefault();
    
    // 基本表单验证
    if (!formData.name || !formData.email || !formData.password) {
      alert('请填写所有必填字段');
      return;
    }

    // 可以在这里添加更复杂的验证逻辑
    // 例如：邮箱格式、密码强度等

    // 导航到设置目标页面
    navigate("/set-goal");
  };

  return (
    <BaseLayout>
      <div className="auth-container bg-login">
        <div className="auth-box">
          <h1>Register</h1>
          <form className="auth-form" onSubmit={handleRegister}>
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              className="auth-input" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              className="auth-input" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              className="auth-input" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
            <p className="privacy-policy">
              By signing up you agree with the <a href="#">Privacy policy</a> and <a href="#">Terms</a> of NutriMatrix
            </p>
            <button type="submit" className="auth-btn">Get started</button>
          </form>
          <p className="login-link">
            Already have an account? <span onClick={() => navigate("/login")}>Sign in</span>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Register;