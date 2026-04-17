import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ai';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  className = '',
  type = 'button'
}) => {
  const styles = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-md",
    secondary: "bg-stone-500 text-white hover:bg-stone-600 shadow-sm",
    outline: "border-2 border-teal-600 text-teal-600 hover:bg-teal-50",
    ai: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 rounded-xl font-medium transition-all active-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden ${className}`}>
    {children}
  </div>
);
