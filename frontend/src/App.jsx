import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DietProvider } from "./context/DietContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetGoal from "./pages/SetGoal";
import FillDetails from "./pages/FillDetails";
import Home from "./pages/Home";
import Goals from "./pages/Goals";
import Diet from "./pages/Diet";
import Exercise from "./pages/Exercise";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import FoodSearch from "./pages/FoodSearch";

function App() {
  return (
    <DietProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/set-goal" element={<SetGoal />} />
          <Route path="/fill-details" element={<FillDetails />} />
          <Route path="/home" element={<Home />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/food-search" element={<FoodSearch />} />
        </Routes>
      </Router>
    </DietProvider>
  );
}

export default App;