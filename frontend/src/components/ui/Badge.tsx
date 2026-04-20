import React from 'react';

interface BadgeProps {
  status: 'Active' | 'Pending' | 'Paused' | 'Completed' | string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch(status) {
      case 'Active':
        return 'border-white bg-white text-black';
      case 'Paused':
        return 'border-white/20 bg-transparent text-white/50';
      case 'Completed':
        return 'border-white/20 bg-white/10 text-white';
      case 'Pending':
      default:
        return 'border-white/40 bg-transparent text-white/80';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {status}
    </span>
  );
};
