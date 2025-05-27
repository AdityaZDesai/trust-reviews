import React from 'react';

export function getPlatformLogo(platform: string, color: string, className = '') {
  // Use the first letter of the platform as the placeholder
  const letter = platform.charAt(0).toUpperCase();
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold ${className}`}
      style={{ backgroundColor: color }}
    >
      <span>{letter}</span>
    </div>
  );
} 