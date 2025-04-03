import { useState } from "react";
import { Trash2, Plus } from 'lucide-react';
import BaseLayout from "../layouts/BaseLayout";
import DateNavigation from "../components/DateNavigation";
import { useExercise } from "../context/ExerciseContext";
import "../styles/theme.css";
import "../styles/pages/Exercise.css";

function Exercise() {
  const { 
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
  } = useExercise();

  const [exerciseType, setExerciseType] = useState('cardio');
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const handleAddExercise = () => {
    if (!exerciseName || !duration || !calories) return;

    addExercise(exerciseType, {
      name: exerciseName,
      duration: parseInt(duration),
      calories: parseInt(calories)
    });

    // 清空输入
    setExerciseName('');
    setDuration('');
    setCalories('');
  };

  const exerciseTypes = [
    { id: 'cardio', name: 'Cardio', targetMinutes: 30, targetCalories: 300 },
    { id: 'strength', name: 'Strength Training', targetSessions: 3 }
  ];

  return (
    <BaseLayout>
      <div className="page-container">
        {/* 日期导航 */}
        <DateNavigation 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />

        {/* 错误显示 */}
        {error && (
          <div className="error-message" style={{
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#fff0f0',
            borderRadius: '5px',
            color: '#d32f2f',
            textAlign: 'center'
          }}>
            {error}
            <button 
              onClick={() => loadExercises()} 
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                background: 'none',
                border: '1px solid #d32f2f',
                borderRadius: '5px',
                cursor: 'pointer',
                color: '#d32f2f'
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid-layout">
          {exerciseTypes.map(type => (
            <div key={type.id} className="card">
              <div className="card-header">
                <h3>{type.name}</h3>
                <div className="header-actions">
                  <span className="target-calories">
                    {type.id === 'strength' ? (
                      `${exercises[type.id]?.length || 0} / ${type.targetSessions} sessions`
                    ) : (
                      `${calculateTypeCalories(type.id)} / ${type.targetCalories} kcal`
                    )}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">Loading...</div>
              ) : exercises[type.id]?.length === 0 ? (
                <div className="exercise-log empty">
                  <p>No {type.name.toLowerCase()} logged today</p>
                </div>
              ) : (
                <div className="exercise-log">
                  {exercises[type.id]?.map(exercise => (
                    <div key={exercise.id} className="exercise-item">
                      <div className="exercise-info">
                        <div className="exercise-name">{exercise.name}</div>
                        <div className="exercise-details">
                          {exercise.duration} min{type.id === 'cardio' ? `, ${exercise.calories} kcal` : ''}
                        </div>
                      </div>
                      <button 
                        className="btn-icon delete-btn"
                        onClick={() => removeExercise(type.id, exercise.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* 添加运动输入卡片 */}
          <div className="card exercise-input-card">
            <div className="card-header">
              <h3>Log Exercise</h3>
            </div>
            <div className="exercise-input-form">
              <select 
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="form-select"
              >
                <option value="cardio">Cardio</option>
                <option value="strength">Strength Training</option>
              </select>

              <input
                type="text"
                placeholder="Exercise Name"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="form-input"
              />

              <div className="input-group">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Calories Burned"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="form-input"
                />
              </div>

              <button 
                className="btn btn-primary add-exercise-btn"
                onClick={handleAddExercise}
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>
          </div>

          {/* 运动摘要卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>Daily Exercise Summary</h3>
            </div>
            <div className="data-row">
              <span className="data-label">Total Calories Burned</span>
              <span className="data-value">{calculateTotalCalories()} kcal</span>
            </div>
            <div className="data-row">
              <span className="data-label">Weekly Goal</span>
              <span className="data-value">1500 kcal</span>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Exercise;