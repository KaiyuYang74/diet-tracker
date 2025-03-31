import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/auth.css";
import "../styles/pages/Index.css";

function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  // 如果已登录，强制登出
  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  return (
    <BaseLayout>
      <div className="auth-container bg-index">
        {/* 左侧内容 */}
        <div className="left-section">
          <h1>
            <span className="highlight">Healthy</span> <span className="subtext">living</span>
          </h1>
          <button className="start-btn" onClick={() => navigate("/login")}>
            Let's Start
          </button>
          <p className="subtitle">Sign in & get started today</p>
        </div>
        {/* 右侧 */}
        <div className="right-section"></div>
      </div>
    </BaseLayout>
  );
}

export default Index;