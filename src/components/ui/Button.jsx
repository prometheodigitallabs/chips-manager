import React from 'react';

const VARIANTS = {
  primary: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm",
  secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 active:bg-red-200",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200",
};

const SIZES = {
  sm: "px-2 py-1 text-xs min-h-[32px]",
  md: "px-4 py-2 text-sm min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[50px]"
};

export const Button = ({ children, onClick, variant = "primary", className = "", size = "md", disabled = false }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${VARIANTS[variant]} ${SIZES[size]} rounded-lg font-medium transition-colors flex items-center gap-2 justify-center select-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
};