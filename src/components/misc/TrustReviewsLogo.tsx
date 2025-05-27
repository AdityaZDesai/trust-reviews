import React from 'react';
import Image from 'next/image';

const TrustReviewsLogo: React.FC = () => (
  <div className="flex items-center">
    <Image 
      src="/brandlogo/brandlogo.png" 
      alt="Trust Reviews Logo" 
      width={150} 
      height={40} 
      className="object-contain"
    />
  </div>
);

export default TrustReviewsLogo;