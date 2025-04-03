import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, X } from 'lucide-react';
import { useWeightRecordAPI } from "../../api/weightRecord";
import "../../styles/components/charts/WeightChangeChart.css";


const WeightChangeChart = () => {
  const weightAPI = useWeightRecordAPI();
  
  const [weightData, setWeightData] = useState([]);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 获取体重数据
  const fetchWeightData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const records = await weightAPI.getRecentWeightRecords();
      
      // 转换数据格式为图表所需格式并确保按日期降序排序
      const formattedData = records
        .map(record => {
          const [year, month, day] = record.recordDate.split('-').map(Number);
          const localDate = new Date(year, month - 1, day); // 确保用本地时区构造
          return {
            date: localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // "Mar 21"
            weight: record.weight,
            id: record.id,
            fullDate: localDate
          };
        })
        .sort((a, b) => a.fullDate - b.fullDate);
    
      
      setWeightData(formattedData);
    } catch (err) {
      console.error("Failed to fetch weight data:", err);
      setError("Failed to load weight data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  // 格式化日期为API所需格式 (YYYY-MM-DD) - 确保使用本地时区
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 解析日期字符串为Date对象 - 确保使用本地时区
  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    // 使用本地时区创建日期（月份需要减1，因为JavaScript中月份从0开始）
    return new Date(year, month - 1, day);
  };
  
  // 组件挂载时获取数据
  useEffect(() => {
    fetchWeightData();
  }, []);
  
  // 处理添加体重记录
  const handleAddWeight = async (e) => {
    e.preventDefault();
    
    if (!newWeight) return;
    
    const weight = parseFloat(newWeight);
    
    if (isNaN(weight) || weight <= 0) {
      setError("Please enter a valid weight");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await weightAPI.addWeightRecord({
        weight,
        date: selectedDate
      });
      
      // 重新获取数据以更新图表
      await fetchWeightData();
      
      // 重置表单
      setNewWeight('');
      setShowInputPanel(false);
    } catch (err) {
      console.error("Failed to add weight record:", err);
      setError("Failed to save weight record. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // 计算体重图表范围
  const getWeightDomain = () => {
    if (weightData.length === 0) return [50, 80]; // 默认范围
    
    const weights = weightData.map(d => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    
    // 确保最小值和最大值之间至少有5kg的差距，以便图表显示更清晰
    const range = Math.max(5, max - min);
    
    // 添加上下边距
    const padding = range * 0.1;
    
    return [
      Math.max(0, Math.floor(min - padding)), // 向下取整
      Math.ceil(max + padding) // 向上取整
    ];
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Weight Change</h3>
        <button 
          className="btn-icon"
          onClick={() => setShowInputPanel(!showInputPanel)}
          title={showInputPanel ? "Cancel" : "Add weight record"}
        >
          {showInputPanel ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>
      
      {/* 错误显示 */}
      {error && (
        <div className="error-message" style={{
          padding: '10px',
          margin: '0 10px 10px',
          backgroundColor: '#fff0f0',
          borderRadius: '5px',
          color: '#d32f2f',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      {/* 浮动输入面板 */}
      {showInputPanel && (
        <div className="weight-input-panel">
          <form onSubmit={handleAddWeight}>
            <div className="input-group">
              <input 
                type="number" 
                className="form-input"
                placeholder="Enter weight (kg)" 
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                step="0.1"
                min="1"
                required
              />
            </div>
            
            <div className="input-group">
              <input 
                type="date" 
                className="form-input"
                value={formatDateForAPI(selectedDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    // 使用本地时区解析日期
                    const newDate = parseDate(e.target.value);
                    setSelectedDate(newDate);
                  }
                }}
                max={formatDateForAPI(new Date())}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Weight"}
            </button>
          </form>
        </div>
      )}
      
      {/* 体重图表 */}
      <div className="chart-container">
        {loading && !weightData.length ? (
          <div className="loading-state">Loading data...</div>
        ) : weightData.length > 0 ? (
          <ResponsiveContainer>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={getWeightDomain()} />
              <Tooltip 
                formatter={(value) => [`${value} kg`, 'Weight']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF8042"
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            No weight records found. Click the + button to add your first weight record.
          </div>
        )}
      </div>
      
      {/* 最近记录列表 - 调整布局使体重和变化值对齐 */}
      {/* {weightData.length > 0 && (
        <div className="recent-weights">
          <h4>Recent Records</h4>
          <div className="weight-records-list">
            <div className="weight-record-grid">
              {weightData.slice(0, 5).map((record, index) => {
                // 计算与下一条记录的差异（如果存在）
                const nextIndex = index + 1;
                const nextWeight = nextIndex < weightData.length ? weightData[nextIndex].weight : null;
                const diff = nextWeight !== null ? record.weight - nextWeight : null;
                
                return (
                  <div key={record.id || index} className="weight-record-item">
                    <div className="weight-record-date">{record.date}</div>
                    <div className="weight-record-value">{record.weight} kg</div>
                    <div className="weight-record-diff-container">
                      {diff !== null ? (
                        <div className={`weight-record-diff ${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </div>
                      ) : (
                        <div className="weight-record-diff empty"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default WeightChangeChart;