import React from 'react';

const TrustReviewsLogo: React.FC = () => (
  <div className="flex items-center -mt-4"> {/* Added negative top margin */}
    <img 
      src="/brandlogo/brandlogo.png" 
      alt="Trust Reviews Logo" 
      className="object-contain w-[180px] h-[100px]"
    />
  </div>
);

export default TrustReviewsLogo;