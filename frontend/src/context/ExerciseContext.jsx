import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useExerciseAPI } from '../api/exercise';

const ExerciseContext = createContext();

export function ExerciseProvider({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  const exerciseAPI = useExerciseAPI();
  
  const [exercises, setExercises] = useState({
    cardio: [],
    strength: []
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 加载特定日期的运动记录
  const loadExercises = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      console.log("Fetching exercise data for date:", formattedDate);
      
      const exerciseData = await exerciseAPI.getUserExerciseByDate(formattedDate);
      console.log("Received exercise data:", exerciseData);
      
      const processedExercises = {
        cardio: [],
        strength: []
      };

      if (exerciseData && Array.isArray(exerciseData)) {
        exerciseData.forEach(exercise => {
          if (!exercise.exerciseType) {
            console.warn("Exercise missing type:", exercise);
            return;
          }
          
          const exerciseItem = {
            id: exercise.id ? exercise.id.toString() : `temp-${Date.now()}`,
            name: exercise.exerciseName || "Unknown exercise",
            duration: exercise.duration || 0,
            calories: exercise.calories || 0,
            date: exercise.date
          };

          const type = exercise.exerciseType.toLowerCase();
          if (processedExercises[type]) {
            processedExercises[type].push(exerciseItem);
          } else {
            console.warn(`Unknown exercise type: ${type}`);
          }
        });
      } else {
        console.log("No exercise data found or data is not an array:", exerciseData);
      }

      setExercises(processedExercises);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      setError('Failed to load exercises. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentDate, exerciseAPI]);

  // 当日期变化或认证状态变化时重新加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadExercises();
    }
  }, [currentDate, isAuthenticated, loadExercises]);

  // 添加运动记录
  const addExercise = useCallback(async (type, exercise) => {
    if (!isAuthenticated) return;
    
    try {
      console.log("Adding exercise:", exercise, "of type:", type);
      
      const savedExercise = await exerciseAPI.addExerciseInput({
        exerciseName: exercise.name,
        exerciseType: type,
        calories: parseInt(exercise.calories),
        duration: parseInt(exercise.duration),
        date: currentDate,
        time: new Date().toTimeString().split(' ')[0]
      });
      
      console.log("Exercise saved successfully:", savedExercise);

      setExercises(prev => ({
        ...prev,
        [type]: [...(prev[type] || []), {
          id: savedExercise.id.toString(),
          name: savedExercise.exerciseName,
          duration: savedExercise.duration,
          calories: savedExercise.calories
        }]
      }));
    } catch (error) {
      console.error('Failed to add exercise:', error);
      setError('Failed to add exercise. Please try again.');
    }
  }, [isAuthenticated, currentDate, exerciseAPI]);

  // 删除运动记录
  const removeExercise = useCallback(async (type, exerciseId) => {
    if (!isAuthenticated) return;

    try {
      console.log("Removing exercise:", exerciseId, "of type:", type);
      await exerciseAPI.deleteExerciseInput(exerciseId);
      
      setExercises(prev => ({
        ...prev,
        [type]: prev[type].filter(ex => ex.id !== exerciseId)
      }));
    } catch (error) {
      console.error('Failed to remove exercise:', error);
      setError('Failed to delete exercise. Please try again.');
    }
  }, [isAuthenticated, exerciseAPI]);

  // 计算总消耗卡路里
  const calculateTotalCalories = useCallback(() => {
    return Object.values(exercises).flat().reduce((total, exercise) => 
      total + (exercise.calories || 0), 0);
  }, [exercises]);

  // 计算特定类型运动的总消耗
  const calculateTypeCalories = useCallback((type) => {
    if (!exercises[type]) return 0;
    return exercises[type].reduce((total, exercise) => 
      total + (exercise.calories || 0), 0);
  }, [exercises]);

  return (
    <ExerciseContext.Provider 
      value={{ 
        exercises, 
        addExercise, 
        removeExercise, 
        calculateTotalCalories,
        calculateTypeCalories,
        currentDate,
        setCurrentDate,
        loadExercises,
        loading,
        error
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExercise() {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExercise must be used within an ExerciseProvider');
  }
  return context;
}