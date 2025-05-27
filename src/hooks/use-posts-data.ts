import { useState } from 'react';
import { postsData } from '@/data/dashboardMockData';
import type { Post } from '@/lib/models';

export function usePostsData(): Post[] {
  // In a real API, you might fetch and set state here
  // For now, just return the mock data
  return postsData as Post[];
} 