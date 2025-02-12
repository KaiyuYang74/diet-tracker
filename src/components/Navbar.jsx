import { Link, useNavigate } from "react-router-dom";
import "../styles/components/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  // 检查是否已登录（可以用 localStorage 代替后端验证）
  const isLoggedIn = localStorage.getItem("authToken"); // 这里用 authToken 作为示例

  // 处理 Logo 点击事件
  const handleLogoClick = () => {
    if (isLoggedIn) {
      navigate("/home"); // 已登录跳转 home
    } else {
      navigate("/"); // 未登录跳转 index
    }
  };

  return (
    <nav className="navbar">
      {/* ✅ 让 logo 变成一个可点击按钮 */}
      <div className="logo" onClick={handleLogoClick}>
        NutriMatrix
      </div>
      <div className="nav-links">
        <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
        <button className="signup-btn" onClick={() => navigate("/register")}>Sign up</button>
      </div>
    </nav>
  );
}

export default Navbar;
