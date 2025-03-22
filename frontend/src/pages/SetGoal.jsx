// SetGoal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import "../styles/auth.css";
import "../styles/pages/SetGoal.css";

function SetGoal() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goals = [
    { id: 1, type: "muscle", label: "Build muscle", gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 2, type: "loss", label: "Loose weight", gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 3, type: "gain", label: "Gain weight", gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 4, type: "maintain", label: "Maintain weight", gradient: "linear-gradient(45deg, #81C784, #66BB6A)" }
  ];

  const handleNext = async () => {
    if (!selectedGoal) return;
    
    setLoading(true);
    setError("");
    
    try {
      const selectedGoalData = goals.find(g => g.id === selectedGoal);
      
      // 保存用户目标类型到localStorage，供推荐组件使用
      localStorage.setItem("userGoal", selectedGoalData.type);
      
      // 如果用户已登录，保存目标到数据库中的User对象
      if (currentUser && currentUser.id) {
        try {
          // 使用PATCH方法更新用户目标类型
          await api.patch(`/users/${currentUser.id}/goal`, {
            goalType: selectedGoalData.type
          });
          
          console.log("Goal saved successfully to user profile");
        } catch (apiError) {
          console.error("Failed to save goal to user profile:", apiError);
          
          // 尝试使用PUT方法更新整个用户对象
          try {
            const userResponse = await api.get(`/users/${currentUser.id}`);
            const userData = userResponse.data;
            
            await api.put(`/users/${currentUser.id}`, {
              ...userData,
              goalType: selectedGoalData.type
            });
            
            console.log("Goal saved successfully using PUT method");
          } catch (putError) {
            console.error("Failed to save goal using PUT method:", putError);
            // 即使保存失败，也继续下一步流程，localStorage中已有备份
          }
        }
      } else {
        console.warn("User not authenticated, proceeding with localStorage only");
      }
      
      // 导航到下一步
      navigate("/fill-details");
    } catch (err) {
      console.error("Error in goal setting process:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="auth-container bg-set-goal">
        <div className="auth-box">
          <h1>Set Your Goal</h1>
          <p>Select your fitness goal to continue</p>
          
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
          
          <div className="goal-options">
            {goals.map((goal) => (
              <button
                key={goal.id}
                className={`goal-btn ${selectedGoal === goal.id ? "selected" : ""}`}
                style={{ background: goal.gradient }}
                onClick={() => setSelectedGoal(goal.id)}
                disabled={loading}
              >
                {goal.label}
              </button>
            ))}
          </div>
          <button 
            className="next-btn" 
            disabled={!selectedGoal || loading} 
            onClick={handleNext}
          >
            {loading ? "Processing..." : "Next"}
          </button>
        </div>
      </div>
    </BaseLayout>
  );
}

export default SetGoal;