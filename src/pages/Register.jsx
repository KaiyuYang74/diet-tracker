import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/pages/Register.css";

function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/set-goal");
  };

  return (
    <BaseLayout>
      <div className="register-container">
        <div className="register-box">
          <h1>Register</h1>
          <form className="register-form" onSubmit={handleRegister}>
            <input type="text" placeholder="Name" className="input-field" required />
            <input type="email" placeholder="Email" className="input-field" required />
            <input type="password" placeholder="Password" className="input-field" required />
            <p className="privacy-policy">
              By signing up you agree with the <a href="#">Privacy policy</a> and <a href="#">Terms</a> of NutriMatrix
            </p>
            <button type="submit" className="register-btn">Get started</button>
          </form>
          <p className="login-link">
            Already have an account? <span onClick={() => navigate("/login")}>Sign in</span>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Register;
