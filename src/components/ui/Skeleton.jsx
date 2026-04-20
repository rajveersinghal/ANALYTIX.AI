import React from 'react';

const Skeleton = ({ className, circle = false }) => {
  return (
    <div 
      className={`animate-shimmer bg-slate-800/50 ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.8) 50%, rgba(30, 41, 59, 0.5) 100%)',
        backgroundSize: '200% 100%'
      }}
    />
  );
};

export default Skeleton;
