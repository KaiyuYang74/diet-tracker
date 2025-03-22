import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { useAuth } from "../context/AuthContext";
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
    goal: "" // 新增：用户目标类型
  });

  // 可选的目标类型
  const goals = [
    { id: 'muscle', label: 'Build Muscle', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'loss', label: 'Loose Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'gain', label: 'Gain Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'maintain', label: 'Maintain Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" }
  ];

  // 加载用户数据
  useEffect(() => {
    if (currentUser && currentUser.id) {
      // 从currentUser对象获取数据
      setFormData({
        name: currentUser.username || "",
        email: currentUser.email || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        currentWeight: currentUser.weight || "",
        targetWeight: currentUser.idealWeight || "",
        height: currentUser.height || "",
        goal: currentUser.goalType || "" // 加载用户目标类型
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setError("");
    
    try {
      // 保存用户数据到API
      const api = await import('../api/axiosConfig').then(module => module.default);
      
      // 获取当前用户数据
      const userResponse = await api.get(`/users/${currentUser.id}`);
      const userData = userResponse.data;
      
      // 更新用户数据
      await api.put(`/users/${currentUser.id}`, {
        ...userData,
        username: formData.name,
        email: formData.email,
        // dateOfBirth 可能需要格式转换
        weight: parseInt(formData.currentWeight) || userData.weight,
        idealWeight: parseInt(formData.targetWeight) || userData.idealWeight,
        height: parseInt(formData.height) || userData.height,
        goalType: formData.goal // 更新目标类型
      });
      
      // 如果目标类型有变化，使用AuthContext的方法更新
      if (formData.goal !== currentUser.goalType) {
        await updateUserGoal(formData.goal);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // 3秒后隐藏成功消息
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
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