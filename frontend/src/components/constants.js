// frontend/src/components/constants.js
// 色彩定义
export const COLORS = [
  '#33CC33',   // 绿色 - 早餐
  '#FFCC00',   // 黄色 - 午餐
  '#FF4D4D'    // 浅红色 - 晚餐
];

// 固定顺序：早餐 -> 午餐 -> 晚餐
export const MEAL_ORDER = ["Breakfast", "Lunch", "Dinner"];

// 样例数据
export const initialMealData = [
  { name: "Breakfast", value: 500, label: "Breakfast" },
  { name: "Lunch", value: 500, label: "Lunch" },
  { name: "Dinner", value: 500, label: "Dinner" }
];

export const trendData = [
  { date: "Feb 5", calories: 1800 },
  { date: "Feb 6", calories: 2000 },
  { date: "Feb 7", calories: 1900 },
  { date: "Feb 8", calories: 2200 }
];

export const weightData = [
  { date: "Feb 5", weight: 68 },
  { date: "Feb 6", weight: 67.8 },
  { date: "Feb 7", weight: 67.5 },
  { date: "Feb 8", weight: 67.2 }
];

// 推荐状态的本地存储键
export const STORAGE_KEY = {
  RECOMMENDATIONS: "foodRecommendations",
  SHOW_RECOMMENDATIONS: "showRecommendations",
  SELECTED_MEAL: "selectedMeal",
  MEAL_DATA: "mealData",
  USER_ID: "userId", // 用户ID存储键
  USER_GOAL: "userGoal" // 新增：用户目标类型存储键
};

// 处理饼图数据，使文字正确显示
export function processMealData(data) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  let currentAngle = 0; // 从0度开始（3点钟位置）
  
  return MEAL_ORDER.map((mealName, index) => {
    // 找到对应的数据项
    const mealItem = data.find(item => item.name === mealName) || { 
      value: index === 0 ? 400 : index === 1 ? 600 : 500 
    };
    
    // 计算该扇区的角度范围（按值的比例）
    const angleExtent = -360 * (mealItem.value / totalValue); // 负值表示逆时针
    
    // 记录当前扇区的起始角度
    const startAngle = currentAngle;
    // 计算结束角度
    const endAngle = startAngle + angleExtent; 
    // 中点角度
    const midAngle = startAngle + angleExtent/2;
    
    // 更新下一个扇区的起始角度
    currentAngle = endAngle;
    
    return {
      name: mealName,
      value: mealItem.value,
      color: COLORS[index],
      startAngle: startAngle,
      endAngle: endAngle, 
      midAngle: midAngle
    };
  });
}