import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Info } from 'lucide-react';
import { useDiet } from "../context/DietContext";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/theme.css";
import "../styles/pages/FoodSearch.css";

function FoodSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addFood } = useDiet();
  const queryParams = new URLSearchParams(location.search);
  const mealType = queryParams.get("meal") || "breakfast";
  
  // Convert meal type to display format
  const getMealTypeDisplay = (type) => {
    switch(type) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snacks': return 'Snacks';
      default: return 'Breakfast';
    }
  };
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("serving");
  
  // Mock API search results
  const mockSearchAPI = (term) => {
    // Mock data - should be replaced with actual API call
    const foods = [
      { id: 1, name: "Egg Noodles", servingSize: "125 g", calories: 443, protein: 12, fat: 8, carbs: 60 },
      { id: 2, name: "Egg Roll", servingSize: "1 piece", calories: 80, protein: 6, fat: 5, carbs: 2 },
      { id: 3, name: "Egg", servingSize: "1 large", calories: 80, protein: 6, fat: 5, carbs: 1 },
      { id: 4, name: "Egg Pasta", servingSize: "100 g", calories: 370, protein: 10, fat: 3, carbs: 45 },
      { id: 5, name: "Whole Wheat Bread", servingSize: "1 slice", calories: 80, protein: 4, fat: 1, carbs: 15 },
      { id: 6, name: "Oatmeal", servingSize: "1 bowl", calories: 150, protein: 5, fat: 3, carbs: 25 },
      { id: 7, name: "Banana", servingSize: "1 medium", calories: 105, protein: 1.3, fat: 0.4, carbs: 27 },
      { id: 8, name: "Apple", servingSize: "1 medium", calories: 95, protein: 0.5, fat: 0.3, carbs: 25 }
    ];
    
    if (!term) return [];
    return foods.filter(food => food.name.toLowerCase().includes(term.toLowerCase()));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const results = mockSearchAPI(searchTerm);
    setSearchResults(results);
  };

  // Select food
  const handleSelectFood = (food) => {
    setSelectedFood(food);
  };

  // Add to food diary
  const handleAddFood = () => {
    if (!selectedFood) return;
    
    // Create food item with quantity
    const foodItem = {
      ...selectedFood,
      quantity: parseFloat(quantity),
      unit: unit,
      id: `${selectedFood.id}-${Date.now()}` // Create unique ID
    };
    
    // Add to diet context
    addFood(mealType, foodItem);
    
    // Return to diet page
    navigate("/diet");
  };

  return (
    <BaseLayout>
      <div className="page-container">
        <div className="search-header">
          <button className="btn-icon back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          <h1>Add Food to {getMealTypeDisplay(mealType)}</h1>
        </div>
        
        {/* Search Box */}
        <div className="search-box-container">
          <div className="search-description">
            Search our food database by name
          </div>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter food name..."
                className="search-input"
              />
              <button type="submit" className="search-btn">
                Search
              </button>
            </div>
          </form>
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && !selectedFood && (
          <div className="search-results">
            <h2>Search Results</h2>
            <div className="results-list">
              {searchResults.map((food) => (
                <div 
                  key={food.id} 
                  className="food-item"
                  onClick={() => handleSelectFood(food)}
                >
                  <div className="food-info">
                    <div className="food-name">{food.name}</div>
                    <div className="food-details">{food.servingSize}, {food.calories} cal</div>
                  </div>
                  <Plus size={20} className="add-icon" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Selected Food Details */}
        {selectedFood && (
          <div className="food-detail-card">
            <h2>{selectedFood.name}</h2>
            
            <div className="quantity-selector">
              <div className="quantity-label">How Much?</div>
              <div className="quantity-input-group">
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  min="0.1" 
                  step="0.1"
                  className="quantity-input"
                />
                <select 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                  className="unit-select"
                >
                  <option value="serving">{selectedFood.servingSize}</option>
                  <option value="grams">grams</option>
                  <option value="ml">ml</option>
                </select>
              </div>
            </div>
            
            <div className="meal-selector">
              <div className="meal-label">Which Meal?</div>
              <select 
                className="meal-select"
                defaultValue={mealType}
                onChange={(e) => navigate(`/food-search?meal=${e.target.value}`)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
            
            <div className="nutrition-info">
              <div className="nutrition-item">
                <span className="label">Calories:</span>
                <span className="value">{Math.round(selectedFood.calories * quantity)} cal</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Protein:</span>
                <span className="value">{(selectedFood.protein * quantity).toFixed(1)}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Fat:</span>
                <span className="value">{(selectedFood.fat * quantity).toFixed(1)}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Carbs:</span>
                <span className="value">{(selectedFood.carbs * quantity).toFixed(1)}g</span>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="btn btn-secondary nutrients-btn">
                <Info size={16} />
                Nutrition Info
              </button>
              <button className="btn btn-primary add-btn" onClick={handleAddFood}>
                Add to Diary
              </button>
            </div>
          </div>
        )}
        
        {/* No Results Message */}
        {searchTerm && searchResults.length === 0 && (
          <div className="no-results">
            <p>No foods found. Would you like to add a new food?</p>
            <button className="btn btn-primary">Add Food to Database</button>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}

export default FoodSearch;