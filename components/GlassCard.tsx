
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-black/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
