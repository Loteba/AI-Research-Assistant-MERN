import React from 'react';
import './Card.css';

const Card = ({ title, icon, children }) => {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          {icon}
          <h2>{title}</h2>
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;