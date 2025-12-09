import React from 'react';

const COLORS = {
  green: "bg-emerald-100 text-emerald-800",
  orange: "bg-orange-100 text-orange-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-800",
  // ... resto de colores
};

export const Badge = ({ children, color = "green" }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${COLORS[color] || COLORS.green}`}>
      {children}
    </span>
  );
};