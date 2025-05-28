import React from 'react';
import Image from 'next/image';

export function getPlatformLogo(platform: string, color: string, className = '') {
  // Normalize the platform name to lowercase for consistent matching
  const platformLower = platform.toLowerCase();
  
  // Determine the logo path based on the platform
  let logoPath = '/source_logos/default.png';
  
  switch (platformLower) {
    case 'reddit':
      logoPath = '/source_logos/reddit.png';
      break;
    case 'tiktok':
      logoPath = '/source_logos/tiktok.png';
      break;
    case 'instagram':
      logoPath = '/source_logos/instagram.png';
      break;
    case 'google':
      logoPath = '/source_logos/google.png';
      break;
    case 'trustpilot':
      logoPath = '/source_logos/trustpilot.png';
      break;
    case 'youtube':
      logoPath = '/source_logos/youtube.png';
      break;
    // Default logo is already set
  }
  
  // Extract size from className if it contains width and height classes
  const sizeMatch = className.match(/w-(\d+)/);
  const size = sizeMatch ? parseInt(sizeMatch[1]) : 10; // Default to 10 if no size found
  
  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: 'white', border: `2px solid ${color}` }}
    >
      <Image 
        src={logoPath}
        alt={`${platform} logo`}
        width={size * 3} // Scale based on the container size
        height={size * 3} // Scale based on the container size
        className="object-contain p-1" // Add padding to prevent logos from touching the border
      />
    </div>
  );
}