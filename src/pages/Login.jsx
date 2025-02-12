import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/pages/Login.css";

function Login() {
  const navigate = useNavigate();

  return (
    <BaseLayout>
      <div className="login-container">
        {/* 左侧登录框 */}
        <div className="login-box">
          <h1>Login</h1>
          <form className="login-form">
            <input type="text" placeholder="Username or Email" className="input-field" />
            <input type="password" placeholder="Password" className="input-field" />
            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <button className="login-btn">Login</button>
          </form>
          <p className="register-link">
            Don’t have an account? <span onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Login;
