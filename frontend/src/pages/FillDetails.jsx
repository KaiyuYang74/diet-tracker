// FillDetails.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { calculateAge } from "../utils/dateUtils";
import "../styles/auth.css";
import "../styles/pages/FillDetails.css";

function FillDetails() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
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
    
    // 表单验证
    if (!formData.dateOfBirth || !formData.weight || 
        !formData.targetWeight || !formData.height) {
      setError("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // 计算年龄 - 使用工具函数
      const age = calculateAge(formData.dateOfBirth);
      
      // 使用用户更新API保存详细信息
      if (currentUser && currentUser.id) {
        const userResponse = await api.get(`/users/${currentUser.id}`);
        const userData = userResponse.data;
        
        // 直接使用表单中的日期字符串
        await api.put(`/users/${currentUser.id}`, {
          ...userData,
          age: age,
          dateOfBirth: formData.dateOfBirth,
          weight: parseInt(formData.weight),
          height: parseInt(formData.height),
          idealWeight: parseInt(formData.targetWeight),
        });
        
        // 确认认证状态后再导航
        if (isAuthenticated) {
          navigate("/home");
        } else {
          setError("Authentication issue. Please try logging in again.");
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