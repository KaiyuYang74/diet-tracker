import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Info } from 'lucide-react';
import { useDiet } from "../context/DietContext";
import BaseLayout from "../layouts/BaseLayout";
import { foodAPI } from "../api/food"; // 导入API服务
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
  const [loading, setLoading] = useState(false);
  

  // 修改初始数据加载使用API
  useEffect(() => {
    const loadInitialFoods = async () => {
      setLoading(true);
      try {
        const foods = await foodAPI.getAllFoods();
        setSearchResults(foods);
      } catch (error) {
        console.error("Error loading initial foods:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialFoods();
  }, []);


  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const results = await foodAPI.searchFoods(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching foods:", error);
      // 可以添加错误提示UI
    } finally {
      setLoading(false);
    }
  };


  // 修改选择食物时通过API获取详情（可选）
  const handleSelectFood = async (food) => {
    try {
      // 如果需要获取更详细的信息，可以通过ID再次获取
      // const detailedFood = await foodAPI.getFoodById(food.id);
      // setSelectedFood(detailedFood);
      
      // 如果返回的数据已经足够，直接使用
      setSelectedFood(food);
    } catch (error) {
      console.error("Error fetching food details:", error);
    }
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
          <h1>Add Food to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h1>
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

        {/* 加载状态 */}
        {loading && (
          <div className="loading-state">Loading...</div>
        )}


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