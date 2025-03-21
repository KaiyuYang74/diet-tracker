import React from 'react';

const FoodItem = ({ food }) => {
  return (
    <div className="recommended-food-item">
      {food}
    </div>
  );
};

export default FoodItem;