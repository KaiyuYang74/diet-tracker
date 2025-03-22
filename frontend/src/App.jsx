// src/App.jsx
import { AppProviders } from "./providers";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
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
import NotFound from './pages/NotFound';

function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 注册后的引导路由 */}
          <Route path="/set-goal" element={<SetGoal />} />
          <Route path="/fill-details" element={<FillDetails />} />
          
          {/* 受保护的路由 - 需要登录 */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          } />
          <Route path="/diet" element={
            <ProtectedRoute>
              <Diet />
            </ProtectedRoute>
          } />
          <Route path="/exercise" element={
            <ProtectedRoute>
              <Exercise />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/food-search" element={
            <ProtectedRoute>
              <FoodSearch />
            </ProtectedRoute>
          } />

          {/* 404页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}

export default App;