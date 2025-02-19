import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/theme.css";
import "../styles/pages/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // 基本信息
    name: "User",
    email: "user@example.com",
    dateOfBirth: "1990-01-01",
    gender: "male",
    // 身体数据
    currentWeight: "70",
    targetWeight: "65",
    height: "175",
    // 目标设置
    goal: "loose" // build, loose, gain, maintain
  });

  const goals = [
    { id: 'build', label: 'Build Muscle', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'loose', label: 'Loose Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'gain', label: 'Gain Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 'maintain', label: 'Maintain Weight', gradient: "linear-gradient(45deg, #81C784, #66BB6A)" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // 处理保存逻辑
    console.log('Saving profile:', formData);
    navigate('/home');
  };

  return (
    <BaseLayout>
      <div className="page-container">
        <div className="profile-box">
          <h1>Profile Settings</h1>
          
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
            <div className="form-group">
              <label className="form-label">Gender</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                  /> Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                  /> Female
                </label>
              </div>
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
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Profile;