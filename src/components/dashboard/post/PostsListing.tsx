import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PostItem from './PostItem';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import type { Post } from '@/lib/models';

// Import AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const PostsListing = () => {
  const { apiData, loading, error } = useDashboardData();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // Default to newest first
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(false);

  useEffect(() => {
    if (apiData?.listings && !loading) {
      // Transform the API listings data to match the Post interface
      const transformedPosts: Post[] = apiData.listings.map(listing => {
        // Parse timestamp properly
        let timestamp;
        if (listing.timestamp) {
          // If it's a string date, convert to timestamp
          timestamp = typeof listing.timestamp === 'string' 
            ? new Date(listing.timestamp).getTime() 
            : listing.timestamp;
        } else {
          timestamp = Date.now();
        }
        
        return {
          id: listing.id || String(Math.random()),
          platform: (listing.source || 'Misc').charAt(0).toUpperCase() + (listing.source || 'Misc').slice(1),
          platformIcon: getPlatformIcon(listing.source),
          content: listing.summary || listing.text || listing.description || 'No content available',
          date: new Date(timestamp).toLocaleDateString(),
          status: listing.status || 'active',
          url: listing.url || listing.link || '',
          timestamp: timestamp, // Store properly parsed timestamp for sorting
        };
      });
      
      // Sort by newest first by default
      const sortedPosts = [...transformedPosts].sort((a, b) => {
        return (b.timestamp as number) - (a.timestamp as number);
      });
      
      setPosts(sortedPosts);
      setFilteredPosts(sortedPosts);
    }
  }, [apiData, loading]);

  // Apply filters and sorting when they change or when posts change
  useEffect(() => {
    let result = [...posts];
    
    // Apply platform filter
    if (platformFilter !== 'all') {
      result = result.filter(post => 
        post.platform.toLowerCase() === platformFilter.toLowerCase()
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(post => post.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return (b.timestamp as number) - (a.timestamp as number);
      } else {
        return (a.timestamp as number) - (b.timestamp as number);
      }
    });
    
    setFilteredPosts(result);
    // Clear selection when filters change
    setSelectedPosts([]);
  }, [platformFilter, statusFilter, sortOrder, posts]);

  const handleSelectPost = (postId: string) => {
    // Find the post to check its status
    const post = posts.find(p => p.id === postId);
    
    // Only allow selection if the post is active
    if (post && post.status === 'active') {
      setSelectedPosts(prev => 
        prev.includes(postId) 
          ? prev.filter(id => id !== postId)
          : [...prev, postId]
      );
    }
  };

  const handleSelectAll = () => {
    // Only select posts with 'active' status
    const activePosts = filteredPosts.filter(post => post.status === 'active');
    setSelectedPosts(activePosts.map(post => post.id));
  };

  const handleDeselectAll = () => {
    setSelectedPosts([]);
  };
  
  // Handle bulk request deletion
  const handleBulkRequestDeletion = () => {
    if (selectedPosts.length === 0) return;
    
    // Only show the dialog, don't make API calls here
    setShowBulkDeleteDialog(true);
    setBulkDeleteSuccess(false);
    setBulkDeleteError(false);
  };
  
  const confirmBulkDeletion = async () => {
    try {
      // Update each selected post's status to 'awaiting'
      const updatePromises = selectedPosts.map(postId => 
        fetch('/api/listings/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify({
            id: postId,
            status: 'awaiting'
          }),
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          selectedPosts.includes(post.id) 
            ? { ...post, status: 'awaiting' } 
            : post
        )
      );
      
      // Clear selection
      setSelectedPosts([]);
      
      // Show success message
      setBulkDeleteSuccess(true);
      setBulkDeleteError(false);
    } catch (error) {
      console.error('Error updating post statuses:', error);
      setBulkDeleteError(true);
      setBulkDeleteSuccess(false);
    }
  };
  
  // Handle status update for a single post
  const handlePostStatusUpdate = (postId: string, newStatus: 'active' | 'awaiting') => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus } 
          : post
      )
    );
  };

  // Handle platform filter change
  const handlePlatformFilterChange = (value: string) => {
    setPlatformFilter(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Handle sort order change
  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading posts...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
        <h1 className="text-4xl font-bold text-sgbus_green-500">Posts</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Platform Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-sm text-gray-600">🔽</span>
              <Select value={platformFilter} onValueChange={handlePlatformFilterChange}>
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
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-sm text-gray-600">🔄</span>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="awaiting">Awaiting</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Sort */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-sm text-gray-600">📅</span>
              <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleSelectAll}
              className="text-dark-slate-gray border-dark-slate-gray hover:bg-dark-slate-gray/10 w-full sm:w-auto"
              disabled={filteredPosts.length === 0}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeselectAll}
              className="text-offred/50 border-offred/50 hover:bg-offred/10 w-full sm:w-auto"
              disabled={selectedPosts.length === 0}
            >
              Deselect All
            </Button>
            <Button 
              className="bg-offred/50 hover:bg-offred/70 text-white w-full sm:w-auto"
              disabled={selectedPosts.length === 0}
              onClick={handleBulkRequestDeletion}
            >
              🗑️ Request Deletion ({selectedPosts.length})
            </Button>
          </div>
        </div>
      </div>
      {/* Posts List */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              flat
              isSelected={selectedPosts.includes(post.id)}
              onSelect={handleSelectPost}
              onStatusUpdate={handlePostStatusUpdate}
            />
          ))
        ) : (
          <div className="text-center p-8 text-gray-500">No posts found</div>
        )}
      </div>
      
      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!bulkDeleteSuccess && !bulkDeleteError 
                ? "Confirm Deletion Request" 
                : bulkDeleteSuccess 
                  ? "Deletion Requests Submitted" 
                  : "Error Requesting Deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!bulkDeleteSuccess && !bulkDeleteError 
                ? `Are you sure you want to request deletion for ${selectedPosts.length} posts? The reviews will be sent to our Team to be reviewed. Our Team will contact you within the next 1-2 days with a quotation for removal.` 
                : bulkDeleteSuccess 
                  ? `Your request to delete ${selectedPosts.length} posts has been submitted successfully. The reviews have been sent to our Team to be reviewed. Our Team will contact you within the next 1-2 days with a quotation for removal.` 
                  : "There was an error processing your deletion requests. Please try again later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!bulkDeleteSuccess && !bulkDeleteError ? (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmBulkDeletion}>Confirm</AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => setShowBulkDeleteDialog(false)}>
                {bulkDeleteSuccess ? "OK" : "Close"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

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

export default PostsListing;
