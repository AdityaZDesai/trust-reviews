import React from 'react';

export const IllustrationSection = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-seasalt to-seasalt/80 overflow-hidden">
      {/* Decorative wave patterns */}
      <div className="absolute top-0 left-0 w-full h-full">
        <svg className="absolute top-8 left-8 w-32 h-16 text-eerie-black/80 opacity-30" viewBox="0 0 128 64" fill="none">
          <path d="M0 32C21.3 32 21.3 0 42.7 0C64 0 64 32 85.3 32C106.7 32 106.7 0 128 0" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
        <svg className="absolute bottom-8 right-8 w-32 h-16 text-eerie-black/80 opacity-30" viewBox="0 0 128 64" fill="none">
          <path d="M0 32C21.3 32 21.3 64 42.7 64C64 64 64 32 85.3 32C106.7 32 106.7 64 128 64" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      {/* Decorative dots pattern */}
      <div className="absolute top-1/4 right-1/4">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="w-3 h-3 bg-sgbus-green/80 transform rotate-45"></div>
          ))}
        </div>
      </div>

      {/* Left side decorative dots */}
      <div className="absolute bottom-1/4 left-8">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="w-2 h-2 bg-sgbus-green/40 transform rotate-45"></div>
          ))}
        </div>
      </div>

      {/* Main illustration container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Background circle */}
          <div className="absolute top-8 right-16 w-16 h-16 border-2 border-eerie-black/80 rounded-full opacity-30"></div>
          
          {/* Clock icon */}
          <div className="absolute top-12 left-8 w-12 h-12 bg-dark-slate-gray rounded-full flex items-center justify-center">
            <div className="w-1 h-4 bg-white rounded-full transform -rotate-45 origin-bottom"></div>
            <div className="w-1 h-3 bg-white rounded-full absolute transform rotate-12 origin-bottom"></div>
          </div>

          {/* Main person illustration */}
          <div className="relative">
            {/* Person body */}
            <div className="w-48 h-64 relative">
              {/* Head */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-seasalt rounded-full">
                {/* Hair */}
                <div className="absolute -top-2 left-1 w-14 h-8 bg-eerie-black rounded-t-full"></div>
                {/* Face features */}
                <div className="absolute top-6 left-4 w-2 h-2 bg-eerie-black rounded-full"></div>
                <div className="absolute top-6 right-4 w-2 h-2 bg-eerie-black rounded-full"></div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-eerie-black rounded-full"></div>
              </div>

              {/* Body */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-20 h-32 bg-sgbus-green rounded-t-3xl"></div>
              
              {/* Arms */}
              <div className="absolute top-20 left-6 w-6 h-20 bg-sgbus-green rounded-full transform -rotate-12"></div>
              <div className="absolute top-20 right-6 w-6 h-20 bg-sgbus-green rounded-full transform rotate-12"></div>
              
              {/* Legs */}
              <div className="absolute bottom-0 left-8 w-8 h-24 bg-eerie-black rounded-full"></div>
              <div className="absolute bottom-0 right-8 w-8 h-24 bg-eerie-black rounded-full"></div>

              {/* Laptop */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-dark-slate-gray rounded-lg">
                <div className="w-full h-2 bg-dark-slate-gray/80 rounded-t-lg"></div>
              </div>

              {/* Papers */}
              <div className="absolute bottom-12 left-2 w-8 h-12 bg-white rounded shadow-md transform -rotate-12"></div>
              <div className="absolute bottom-16 left-6 w-8 h-12 bg-white rounded shadow-md transform rotate-6"></div>
              <div className="absolute bottom-14 right-2 w-8 h-12 bg-white rounded shadow-md"></div>

              {/* Coffee cup */}
              <div className="absolute top-32 right-0 w-6 h-8 bg-white rounded-b-full flex flex-col items-center">
                <div className="w-full h-2 bg-dark-slate-gray rounded-t-full"></div>
                <div className="w-4 h-2 bg-dark-slate-gray rounded-b-full mt-1"></div> {/* Cup band */}
              </div>

              {/* Speech bubble */}
              <div className="absolute top-4 left-0 w-12 h-8 bg-sgbus-green/80 rounded-full flex items-center justify-center border-2 border-sgbus-green">
                {/* Search icon */}
                <svg className="w-6 h-6 text-dark-slate-gray" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="6" />
                  <line x1="17" y1="17" x2="21" y2="21" />
                </svg>
              </div>
            </div>
          </div>

          {/* Book stack */}
          <div className="absolute bottom-0 right-4 flex flex-col gap-1">
            <div className="w-16 h-3 bg-seasalt rounded flex items-center">
              <div className="w-8 h-1 bg-dark-slate-gray ml-2"></div>
            </div>
            <div className="w-16 h-3 bg-seasalt rounded flex items-center">
              <div className="w-8 h-1 bg-sgbus-green ml-2"></div>
            </div>
            <div className="w-16 h-3 bg-seasalt rounded flex items-center">
              <div className="w-8 h-1 bg-offred ml-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IllustrationSection;