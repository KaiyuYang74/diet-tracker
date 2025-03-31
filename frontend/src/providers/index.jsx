// src/providers/index.jsx
import { AuthProvider } from "../context/AuthContext";
import { DietProvider } from "../context/DietContext";
import { ExerciseProvider } from "../context/ExerciseContext";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <DietProvider>
        <ExerciseProvider>
          {children}
        </ExerciseProvider>
      </DietProvider>
    </AuthProvider>
  );
}
