import React from 'react';

const CalorieIndicator = ({ label, value }) => (
  <div className="indicator">
    <span className="indicator-label">{label}</span>
    <span className="indicator-value">{value}</span>
  </div>
);

export default CalorieIndicator;