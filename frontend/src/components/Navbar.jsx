import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/components/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 获取当前路径并转换为小写
  const currentPath = location.pathname.toLowerCase();

  // 更新登录状态检查逻辑，包含所有需要登录的路径
  const loggedInPaths = ['/home', '/goals', '/diet', '/exercise', '/profile', '/settings'];
  const isLoggedIn = loggedInPaths.includes(currentPath);
  
  // 检查是否在注册/填写信息流程中
  const isOnboardingPage = ['/set-goal', '/fill-details'].includes(currentPath);

  // 处理 Logo 点击事件
  const handleLogoClick = () => {
    if (isLoggedIn) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={handleLogoClick}>
        NutriMatrix
      </div>
      <div className="nav-links">
        {!isLoggedIn && !isOnboardingPage && (
          <>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="signup-btn" onClick={() => navigate("/register")}>
              Sign up
            </button>
          </>
        )}
        {isLoggedIn && (
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
                  onClick={() => { 
                    localStorage.removeItem('authToken');
                    navigate('/');
                    setIsDropdownOpen(false);
                  }}
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