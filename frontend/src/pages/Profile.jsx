import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { calculateAge } from "../utils/dateUtils";
import "../styles/theme.css";
import "../styles/pages/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { currentUser, updateUserGoal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    // 基本信息
    name: "",
    email: "",
    dateOfBirth: "",
    // 身体数据
    currentWeight: "",
    targetWeight: "",
    height: "",
    // 目标设置
    goal: "" // 用户目标类型
  });

  // 可选的目标类型
  const goals = [
    { id: 'muscle', label: 'Build Muscle', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'loss', label: 'Loose Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'gain', label: 'Gain Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'maintain', label: 'Maintain Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" }
  ];

  // 处理表单变更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 加载用户数据
  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser && currentUser.id) {
        setLoading(true);
        
        try {
          const response = await api.get(`/users/${currentUser.id}`);
          const userData = response.data;

          console.log('Received User Data:', userData);
          console.log('Received DateOfBirth:', userData.dateOfBirth);
          
          // 直接使用后端返回的日期字符串
          setFormData({
            name: userData.username || "",
            email: userData.email || "",
            dateOfBirth: userData.dateOfBirth || "", // 直接使用日期字符串
            currentWeight: userData.weight ? userData.weight.toString() : "",
            targetWeight: userData.idealWeight ? userData.idealWeight.toString() : "",
            height: userData.height ? userData.height.toString() : "",
            goal: userData.goalType || ""
          });
        } catch (err) {
          console.error("加载用户数据失败:", err);
          setError("无法加载用户数据，请刷新页面重试。");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadUserProfile();
  }, [currentUser]);

  const handleSubmit = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setError("");
    
    try {
      // 获取当前用户数据
      console.log('Input Date:', formData.dateOfBirth);
      const userResponse = await api.get(`/users/${currentUser.id}`);
      const userData = userResponse.data;
      
      // 计算年龄 - 使用工具函数
      const age = calculateAge(formData.dateOfBirth);
      
      // 构建更新对象 - 直接使用日期字符串
      const updatedUser = {
        ...userData,
        username: formData.name,
        email: formData.email,
        age: age,
        dateOfBirth: formData.dateOfBirth || null,
        weight: parseInt(formData.currentWeight) || userData.weight,
        height: parseInt(formData.height) || userData.height,
        idealWeight: parseInt(formData.targetWeight) || userData.idealWeight,
        goalType: formData.goal
      };

      console.log('Sending User Data:', updatedUser);
      
      // 发送更新请求
      await api.put(`/users/${currentUser.id}`, updatedUser);
      
      // 如果目标类型有变化，使用AuthContext的方法更新
      if (formData.goal !== currentUser.goalType) {
        await updateUserGoal(formData.goal);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("保存个人信息错误:", err);
      setError("保存个人信息失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="page-container">
        <div className="profile-box">
          <h1>Profile Settings</h1>
          
          {error && (
            <div className="error-message" style={{
              padding: '10px',
              margin: '10px 0',
              backgroundColor: '#fff0f0',
              borderRadius: '5px',
              color: '#d32f2f'
            }}>
              {error}
            </div>
          )}
          
          {saveSuccess && (
            <div className="success-message" style={{
              padding: '10px',
              margin: '10px 0',
              backgroundColor: '#e8f5e9',
              borderRadius: '5px',
              color: '#2e7d32'
            }}>
              Profile saved successfully!
            </div>
          )}
          
          {/* 基本信息卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>Basic Information</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 身体数据卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>Body Data</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Current Weight (kg)</label>
              <input
                type="number"
                name="currentWeight"
                className="form-input"
                value={formData.currentWeight}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Weight (kg)</label>
              <input
                type="number"
                name="targetWeight"
                className="form-input"
                value={formData.targetWeight}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                name="height"
                className="form-input"
                value={formData.height}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 目标设置卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>Fitness Goal</h3>
            </div>
            <div className="goal-options">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  className={`goal-btn ${formData.goal === goal.id ? "selected" : ""}`}
                  style={{ background: goal.gradient }}
                  onClick={() => setFormData(prev => ({ ...prev, goal: goal.id }))}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Profile;