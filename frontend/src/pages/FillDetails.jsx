// FillDetails.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig"; // 添加API导入
import "../styles/auth.css";
import "../styles/pages/FillDetails.css";

function FillDetails() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth(); // 获取认证状态
  
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    weight: "",
    targetWeight: "",
    height: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证 - 已移除gender字段的检查
    if (!formData.dateOfBirth || !formData.weight || 
        !formData.targetWeight || !formData.height) {
      setError("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // 计算年龄
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // 使用用户更新API保存详细信息
      if (currentUser && currentUser.id) {
        // 从后端获取当前用户信息
        const userResponse = await api.get(`/users/${currentUser.id}`);
        const userData = userResponse.data;
        
        // 更新用户数据
        await api.put(`/users/${currentUser.id}`, {
          ...userData, // 保留原有信息
          age: age, // 年龄计算
          weight: parseInt(formData.weight),
          height: parseInt(formData.height),
          idealWeight: parseInt(formData.targetWeight),
        });
        
        console.log("User details saved successfully");
        
        // 确认认证状态后再导航
        if (isAuthenticated) {
          navigate("/home");
        } else {
          setError("Authentication issue. Please try logging in again.");
          console.error("User not authenticated after registration flow");
        }
      } else {
        throw new Error("User ID not available");
      }
    } catch (err) {
      console.error("Failed to save user details:", err);
      setError("Failed to save your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="auth-container bg-fill-details">
        <div className="auth-box">
          <h1>Fill up your details</h1>
          
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
              type="date" 
              className="auth-input" 
              placeholder="Enter your date of birth here" 
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={loading}
            />
            
            {/* 性别选择部分已移除 */}

            <input 
              type="number" 
              className="auth-input" 
              placeholder="Enter your current weight in kgs"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              disabled={loading}
            />

            <input 
              type="number" 
              className="auth-input" 
              placeholder="Enter your desired weight in kgs"
              name="targetWeight"
              value={formData.targetWeight}
              onChange={handleChange}
              disabled={loading}
            />

            <input 
              type="number" 
              className="auth-input" 
              placeholder="Enter your height in cms"
              name="height"
              value={formData.height}
              onChange={handleChange}
              disabled={loading}
            />

            <button 
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? "Processing..." : "Create my plan"}
            </button>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
}

export default FillDetails;