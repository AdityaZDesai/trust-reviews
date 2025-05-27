import React from 'react';
import Image from 'next/image';

export const IllustrationSection = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-seasalt to-seasalt/80 overflow-hidden flex items-center justify-center">
      <div className="relative w-full h-full">
        <Image
          src="/illustration/illustration.png"
          alt="Login Illustration"
          width={800}
          height={600}
          className="w-full h-full object-contain"
          unoptimized={true}
        />
      </div>
    </div>
  );
};

export default IllustrationSection;