import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Info } from 'lucide-react';
import { useDiet } from "../context/DietContext";
import BaseLayout from "../layouts/BaseLayout";
import { foodAPI } from "../api/food";
import { dietInputAPI } from "../api/dietInput";
import "../styles/theme.css";
import "../styles/pages/FoodSearch.css";

function FoodSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addFood } = useDiet();
  const queryParams = new URLSearchParams(location.search);
  const mealType = queryParams.get("meal") || "breakfast";
  
  // 状态
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("serving");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 将餐次类型转换为显示格式
  const getMealTypeDisplay = (type) => {
    switch(type) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snacks': return 'Snacks';
      default: return 'Breakfast';
    }
  };

  // 处理搜索
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      console.log(`Searching for: "${searchTerm}"`);
      const results = await foodAPI.searchFoods(searchTerm);
      console.log("Search results:", results);
      
      setSearchResults(results || []);
    } catch (error) {
      console.error("Error searching foods:", error);
      setError("Failed to search the food database");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 选择食物
  const handleSelectFood = (food) => {
    console.log("Selected food:", food);
    setSelectedFood(food);
  };

  // 添加到食物日记
  const handleAddFood = async () => {
    if (!selectedFood) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const dietDate = queryParams.get('date');
      console.log("Original date from URL:", dietDate);

      const formattedDate = queryParams.get('date') || 
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;      console.log("Using formatted date:", formattedDate);
      
      // 创建要保存的对象 - 不包含userId，API会自动使用当前用户的ID
      const dietInput = {
        foodId: selectedFood.id.toString(),
        dietType: mealType,
        calories: Math.round(selectedFood.calories * quantity),
        date: formattedDate,
        time: new Date().toTimeString().split(' ')[0],
        quantity: parseFloat(quantity)
      };
      
      console.log("Adding food to diary:", dietInput);
      
      // 调用API保存到数据库
      const result = await dietInputAPI.addDietInput(dietInput);
      console.log("API response:", result);
      
      // 添加到本地状态
      const foodItem = {
        ...selectedFood,
        quantity: parseFloat(quantity),
        unit: unit,
        id: result.dietID ? result.dietID.toString() : `${selectedFood.id}-${Date.now()}`,
        dietID: result.dietID
      };
      
      addFood(mealType, foodItem);
      
      // 返回到饮食页面
      console.log("Redirecting to:", `/diet?date=${formattedDate}`);
      navigate(`/diet?date=${formattedDate}`);
    } catch (error) {
      console.error("Failed to add food:", error);
      setError("Failed to save food entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="page-container">
        {/* 加载和错误状态 */}
        {loading && <div className="loading-message">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        
        <div className="search-header">
          <button className="btn-icon back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          <h1>Add Food to {getMealTypeDisplay(mealType)}</h1>
        </div>
        
        {/* 搜索框 */}
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
        
        {/* 搜索结果 */}
        {hasSearched && searchResults.length > 0 && !selectedFood && (
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
        
        {/* 选中食物详情 */}
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
        
        {/* 无结果提示 */}
        {hasSearched && searchTerm && searchResults.length === 0 && !loading && (
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