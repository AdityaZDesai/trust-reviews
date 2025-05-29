import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getPlatformLogo } from '@/components/dashboard/main/platformLogo';
import { Eye, Trash2, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Post } from '@/lib/models';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const platformColors: Record<string, string> = {
  Google: '#EA4335',
  Reddit: '#FF4500',
  Instagram: '#C13584',
  TikTok: '#010101',
  Misc: '#222',
};

interface PostItemProps {
  post: Post;
  flat?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onStatusUpdate?: (id: string, newStatus: 'active' | 'awaiting') => void;
}

export const PostItem = ({ post, flat, isSelected = false, onSelect, onStatusUpdate }: PostItemProps) => {
  const color = platformColors[post.platform] || '#888';
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // Check if the post date is today
  const isToday = () => {
    const today = new Date().toLocaleDateString();
    return post.date === today;
  };
  
  // Apply red highlight for today's posts
  const todayHighlight = isToday() ? 'border-2 border-offred bg-offred/5' : '';
  
  // Apply selection highlight
  const selectionHighlight = isSelected ? 'border-2 border-blue-500 bg-blue-50' : '';
  
  // Handle view button click - open the URL in a new tab
  const handleViewClick = () => {
    // If the post has a URL, open it in a new tab
    // For posts from the API, the URL might be in different fields
    const url = post.url || 
               (post.platform.toLowerCase() === 'google' ? `https://www.google.com/search?q=${encodeURIComponent(post.content)}` : null) ||
               (post.platform.toLowerCase() === 'reddit' ? `https://www.reddit.com/search/?q=${encodeURIComponent(post.content)}` : null);
    
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No URL available for this post');
    }
  };
  
  // Handle checkbox click
  const handleCheckboxChange = () => {
    if (onSelect && post.status === 'active') {
      onSelect(post.id);
    }
  };
  
  // Handle request deletion button click
  const handleRequestDeletion = () => {
    // Only show the dialog, don't make API calls here
    setShowDeleteDialog(true);
    
    if (post.status === 'awaiting') {
      setDeleteSuccess(false);
    }
  };
  
  const content = (
    <>
      {/* Left Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0 w-full sm:w-auto flex-1">
        {/* Selection Checkbox */}
        <div className="flex items-center h-full">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="mr-2"
            id={`select-post-${post.id}`}
            disabled={post.status !== 'active'} // Disable checkbox if post is not active
          />
        </div>
        {/* Green dot */}
        <div className="w-3 h-3 rounded-full bg-sgbus-green flex-shrink-0" />
        {/* Platform Icon */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-200">
          {getPlatformLogo(post.platform, color, 'w-10 h-10')}
        </div>
        {/* Content */}
        <div className="min-w-0 max-w-full">
          <h3 className="font-bold text-lg text-eerie-black truncate">{post.platform}</h3>
          <p className="text-gray-500 text-base break-words whitespace-pre-line max-w-full">{post.content}</p>
        </div>
      </div>
      {/* Right Section */}
      <div className="flex flex-col sm:flex-col items-end sm:items-end gap-2 sm:gap-2 min-w-[140px] sm:min-w-[180px] w-full sm:w-auto mt-2 sm:mt-0">
        {/* Date */}
        <div className={`flex items-center ${isToday() ? 'text-offred font-bold' : 'text-gray-400'} text-base gap-1 mb-1 sm:mb-0`}>
          <Calendar className={`w-5 h-5 ${isToday() ? 'text-offred' : ''}`} />
          {post.date}
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            className="bg-dark-slate-gray text-white hover:bg-dark-slate-gray/90 rounded-full px-4 sm:px-6 py-2 text-base font-semibold flex items-center gap-2 shadow-none border-0"
            onClick={handleViewClick}
          >
            <Eye className="w-5 h-5" /> View
          </Button>
          
          {post.status === 'active' ? (
            <Button 
              className="bg-offred text-white hover:bg-offred/90 rounded-full px-4 sm:px-6 py-2 text-base font-semibold flex items-center gap-2 shadow-none border-0"
              onClick={handleRequestDeletion}
              disabled={isUpdating}
            >
              <Trash2 className="w-5 h-5" /> Request Deletion
            </Button>
          ) : (
            <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-medium flex items-center">
              Status: {post.status === 'awaiting' ? 'Awaiting' : post.status}
            </div>
          )}
        </div>
      </div>
      
      {/* Deletion Request Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteSuccess 
                ? "Deletion Request Submitted" 
                : post.status === 'awaiting' 
                  ? "Already Awaiting Deletion" 
                  : "Confirm Deletion Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteSuccess 
                ? "Your request to delete this post has been submitted successfully. The reviews have been sent to our Team to be reviewed. Our Team will contact you within the next 1-2 days with a quotation for removal." 
                : post.status === 'awaiting' 
                  ? "This post is already marked as awaiting deletion." 
                  : "Are you sure you want to request deletion for this post? The reviews will be sent to our Team to be reviewed. Our Team will contact you within the next 1-2 days with a quotation for removal."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!deleteSuccess && post.status !== 'awaiting' ? (
              <>
                <AlertDialogAction onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogAction>
                <AlertDialogAction onClick={async () => {
                  try {
                    setIsUpdating(true);
                    
                    const response = await fetch('/api/listings/update-status', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        id: post.id,
                        status: 'awaiting'
                      }),
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to update status');
                    }
                    
                    // Call the onStatusUpdate callback if provided
                    if (onStatusUpdate) {
                      onStatusUpdate(post.id, 'awaiting');
                    }
                    
                    // Show success dialog
                    setDeleteSuccess(true);
                  } catch (error) {
                    console.error('Error updating post status:', error);
                    // Show error dialog
                    setDeleteSuccess(false);
                    setShowDeleteDialog(false);
                  } finally {
                    setIsUpdating(false);
                  }
                }}>Confirm</AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => setShowDeleteDialog(false)}>
                {deleteSuccess ? "OK" : "Close"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
  return flat ? (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-0 p-4 rounded-2xl ${todayHighlight} ${selectionHighlight}`}>
      {content}
    </div>
  ) : (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 gap-2 sm:gap-0 ${todayHighlight} ${selectionHighlight}`}>
      {content}
    </div>
  );
};

export default PostItem;
