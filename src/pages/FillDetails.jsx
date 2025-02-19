// FillDetails.jsx
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/auth.css";
import "../styles/pages/FillDetails.css";

function FillDetails() {
  const navigate = useNavigate();

  return (
    <BaseLayout>
      <div className="auth-container bg-fill-details">
        <div className="auth-box">
          <h1>Fill up your details</h1>
          <form className="auth-form">
            <input 
              type="date" 
              className="auth-input" 
              placeholder="Enter your date of birth here" 
            />
            
            <div className="gender-options">
              <label><input type="radio" name="gender" value="male" /> Male</label>
              <label><input type="radio" name="gender" value="female" /> Female</label>
            </div>

            <input 
              type="number" 
              className="auth-input" 
              placeholder="Enter your current weight in kgs" 
            />

            <input 
              type="number" 
              className="auth-input" 
              placeholder="Enter your desired weight in kgs" 
            />

            <input 
              type="number" 
              className="auth-input" 
              placeholder="Enter your height in cms" 
            />

            <button 
              className="auth-btn" 
              onClick={() => navigate("/home")}
            >
              Create my plan
            </button>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
}

export default FillDetails;