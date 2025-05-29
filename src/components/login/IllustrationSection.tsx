import React from 'react';

export const IllustrationSection = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-seasalt to-seasalt/80 overflow-hidden flex items-center justify-center">
      <div className="relative w-full h-full">
        <img
          src="/illustration/illustration.png"
          alt="Login Illustration"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default IllustrationSection;