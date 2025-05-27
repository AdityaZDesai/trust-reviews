import { illustrationElements } from '@/data/mockData';
import type { IllustrationElements } from '@/lib/models';

export function useIllustrationElements(): IllustrationElements {
  // In a real API, you might fetch and set state here
  // For now, just return the mock data
  return illustrationElements as IllustrationElements;
} 