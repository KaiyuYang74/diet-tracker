import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/components/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  // 获取当前路径并转换为小写
  const currentPath = location.pathname.toLowerCase();

  // 检查是否在注册/填写信息流程中
  const isOnboardingPage = ['/set-goal', '/fill-details'].includes(currentPath);

  // 处理 Logo 点击事件
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };
  
  // 处理登出
  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={handleLogoClick}>
        NutriMatrix
      </div>
      <div className="nav-links">
        {!isAuthenticated && !isOnboardingPage && (
          <>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="signup-btn" onClick={() => navigate("/register")}>
              Sign up
            </button>
          </>
        )}
        {isAuthenticated && (
          <div className="user-menu">
            <button 
              className="user-avatar" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ minWidth: '40px' }}
            >
              U
            </button>
            {isDropdownOpen && (
              <div className="menu-dropdown">
                <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}>
                  👤 Profile
                </button>
                <button onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}>
                  ⚙️ Settings
                </button>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;