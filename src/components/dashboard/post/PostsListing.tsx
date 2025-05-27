import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PostItem from './PostItem';
import { usePostsData } from '@/hooks/use-posts-data';

export const PostsListing = () => {
  const postsData = usePostsData();
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPosts(postsData.map(post => post.id));
  };

  const handleDeselectAll = () => {
    setSelectedPosts([]);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
        <h1 className="text-4xl font-bold text-sgbus_green-500">Posts</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600">🔽</span>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Action Buttons */}
          <Button 
            variant="outline" 
            onClick={handleDeselectAll}
            className="text-offred/50 border-offred/50 hover:bg-offred/70 w-full sm:w-auto"
          >
            Deselect All
          </Button>
          <Button 
            className="bg-offred/50 hover:bg-offred/70 text-white w-full sm:w-auto"
            disabled={selectedPosts.length === 0}
          >
            🗑️ Request Deletion ({selectedPosts.length})
          </Button>
        </div>
      </div>
      {/* Posts List */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {postsData.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            flat
          />
        ))}
      </div>
    </div>
  );
};

export default PostsListing;
