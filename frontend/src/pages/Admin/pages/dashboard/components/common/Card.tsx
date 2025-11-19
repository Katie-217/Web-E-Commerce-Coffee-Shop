import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-background-light p-6 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

export default Card;






