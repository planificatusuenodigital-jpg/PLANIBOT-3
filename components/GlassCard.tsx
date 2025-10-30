

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  // FIX: Added onClick prop to allow click handlers on the GlassCard component.
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-black/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;