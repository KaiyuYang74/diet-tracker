import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/pages/SetGoal.css";

function SetGoal() {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);

  const goals = [
    { id: 1, label: "build muscle", gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 2, label: "Loose weight", gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 3, label: "Gain weight", gradient: "linear-gradient(45deg, #81C784, #66BB6A)" },
    { id: 4, label: "Maintain weight", gradient: "linear-gradient(45deg, #81C784, #66BB6A)" }
  ];

  return (
    <BaseLayout>
      <div className="set-goal-container">
        <div className="set-goal-box">
          <h1>Set Your Goal</h1>
          <p>Select your fitness goal to continue</p>
          <div className="goal-options">
            {goals.map((goal) => (
              <button
                key={goal.id}
                className={`goal-btn ${selectedGoal === goal.id ? "selected" : ""}`}
                style={{ background: goal.gradient }}
                onClick={() => setSelectedGoal(goal.id)}
              >
                {goal.label}
              </button>
            ))}
          </div>
          <button className="next-btn" disabled={!selectedGoal} onClick={() => navigate("/fill-details")}>Next</button>
        </div>
      </div>
    </BaseLayout>
  );
}

export default SetGoal;
