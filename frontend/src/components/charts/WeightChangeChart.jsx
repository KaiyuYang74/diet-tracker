import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const WeightChangeChart = ({ data }) => {
  // 计算体重图表范围
  const getWeightDomain = () => {
    const weights = data.map(d => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Weight Change</h3>
      </div>
      <div className="chart-container">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={getWeightDomain()} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#FF8042" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeightChangeChart;