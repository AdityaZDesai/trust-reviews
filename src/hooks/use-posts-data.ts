import { useState, useEffect } from 'react';
import { useDashboardData } from './use-dashboard-data';
import { postsData as mockPostsData } from '@/data/dashboardMockData';
import type { Post } from '@/lib/models';

export function usePostsData(): Post[] {
  const { apiData, loading } = useDashboardData();
  const [posts, setPosts] = useState<Post[]>(mockPostsData as Post[]);

  useEffect(() => {
    if (apiData?.listings && !loading) {
      // Transform the API listings data to match the Post interface
      const transformedPosts: Post[] = apiData.listings.map(listing => ({
        id: listing.id || String(Math.random()),
        platform: (listing.source || 'Misc').charAt(0).toUpperCase() + (listing.source || 'Misc').slice(1),
        platformIcon: getPlatformIcon(listing.source),
        content: listing.text || listing.summary || listing.description || 'No content available',
        date: new Date(listing.timestamp || Date.now()).toLocaleDateString(),
        status: listing.status || 'active'
      }));
      
      setPosts(transformedPosts);
    }
  }, [apiData, loading]);

  return posts;
}

// Helper function to get platform icons
function getPlatformIcon(source?: string): string {
  const platform = (source || '').toLowerCase();
  
  switch (platform) {
    case 'tiktok': return '🎵';
    case 'reddit': return '🔴';
    case 'google': return '🔍';
    case 'instagram': return '📸';
    case 'trustpilot': return '⭐';
    case 'youtube': return '▶️';
    default: return '🌐';
  }
}