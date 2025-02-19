// Login.jsx
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/auth.css";
import "../styles/pages/Login.css";

function Login() {
  const navigate = useNavigate();

  return (
    <BaseLayout>
      <div className="auth-container bg-login">
        <div className="auth-box">
          <h1>Login</h1>
          <form className="auth-form">
            <input type="text" placeholder="Username or Email" className="auth-input" />
            <input type="password" placeholder="Password" className="auth-input" />
            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <button className="auth-btn">Login</button>
          </form>
          <p className="auth-link">
            Don't have an account? <span onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Login;