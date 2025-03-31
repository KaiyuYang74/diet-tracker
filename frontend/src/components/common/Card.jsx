import React from 'react';

/**
 * 通用卡片组件
 * 
 * @param {Object} props
 * @param {string} props.title - 卡片标题
 * @param {React.ReactNode} props.children - 卡片内容
 * @param {React.ReactNode} props.headerExtra - 卡片标题右侧额外内容
 * @param {string} props.className - 额外的CSS类名
 */
const Card = ({ title, children, headerExtra, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h3>{title}</h3>
          {headerExtra}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;