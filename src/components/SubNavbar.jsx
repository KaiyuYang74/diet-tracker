import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/components/SubNavbar.css";

function SubNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 定义子导航项
  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/diet', label: 'Diet', icon: '🍽️' },
    { path: '/exercise', label: 'Exercise', icon: '💪' }
  ];

  // 判断当前路径是否激活
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sub-navbar">
      <div className="sub-nav-container">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`sub-nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {isActive(item.path) && <div className="nav-indicator" />}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default SubNavbar;