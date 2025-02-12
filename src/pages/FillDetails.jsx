import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/pages/FillDetails.css";

function FillDetails() {
  const navigate = useNavigate();

  return (
    <BaseLayout>
      <div className="fill-details-container">
        <div className="fill-details-box">
          <h1>Fill up your details</h1>
          <form className="details-form">

            <input type="date" className="input-field" placeholder="Enter your date of birth here" />
            
            <div className="gender-options">
              <label><input type="radio" name="gender" value="male" /> Male</label>
              <label><input type="radio" name="gender" value="female" /> Female</label>
            </div>

            <input type="number" className="input-field" placeholder="Enter your current weight in kgs" />

            <input type="number" className="input-field" placeholder="Enter your desired weight in kgs" />

            <input type="number" className="input-field" placeholder="Enter your height in cms" />

            <button className="create-plan-btn" onClick={() => navigate("/home")}>Create my plan</button>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
}

export default FillDetails;