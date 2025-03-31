// frontend/src/components/DateNavigation.jsx
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import "../styles/components/DateNavigation.css";

function DateNavigation({ currentDate, setCurrentDate }) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 处理前一天
  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  // 处理后一天
  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  // 设置为今天
  const handleToday = () => {
    setCurrentDate(new Date());
    setShowDatePicker(false);
  };

  // 处理日期选择
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setCurrentDate(selectedDate);
    setShowDatePicker(false);
  };

  // 格式化日期显示
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 日期选择器使用的格式 YYYY-MM-DD
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="date-nav">
      <button 
        className="btn-icon"
        onClick={handlePrevDay}
        title="Previous Day"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="date-selector">
        <div 
          className="current-date"
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          {formatDate(currentDate)}
        </div>
        
        {showDatePicker && (
          <div className="date-picker-container">
            <input
              type="date"
              value={formatDateForInput(currentDate)}
              onChange={handleDateChange}
              className="date-picker"
            />
            <button 
              className="today-btn"
              onClick={handleToday}
            >
              Today
            </button>
          </div>
        )}
      </div>
      
      <button 
        className="btn-icon"
        onClick={handleNextDay}
        title="Next Day"
      >
        <ChevronRight size={20} />
      </button>
      
      <button 
        className="btn-icon"
        onClick={() => setShowDatePicker(!showDatePicker)}
        title="Select Date"
      >
        <Calendar size={20} />
      </button>
    </div>
  );
}

export default DateNavigation;