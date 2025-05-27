import React from 'react';
import { Button } from '@/components/ui/button';
import { getPlatformLogo } from '@/components/dashboard/main/platformLogo';
import { Eye, Trash2, Calendar } from 'lucide-react';

interface Post {
  id: string;
  platform: string;
  platformIcon: string;
  content: string;
  date: string;
  status: 'active' | 'pending';
}

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
}

export const PostItem = ({ post, flat }: PostItemProps) => {
  const color = platformColors[post.platform] || '#888';
  const content = (
    <>
      {/* Left Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0 w-full sm:w-auto flex-1">
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
        <div className="flex items-center text-gray-400 text-base gap-1 mb-1 sm:mb-0">
          <Calendar className="w-5 h-5" />
          {post.date}
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            className="bg-dark-slate-gray text-white hover:bg-dark-slate-gray/90 rounded-full px-4 sm:px-6 py-2 text-base font-semibold flex items-center gap-2 shadow-none border-0"
          >
            <Eye className="w-5 h-5" /> View
          </Button>
          <Button 
            className="bg-offred text-white hover:bg-offred/90 rounded-full px-4 sm:px-6 py-2 text-base font-semibold flex items-center gap-2 shadow-none border-0"
          >
            <Trash2 className="w-5 h-5" /> Request Deletion
          </Button>
        </div>
      </div>
    </>
  );
  return flat ? (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-0">
      {content}
    </div>
  ) : (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 gap-2 sm:gap-0">
      {content}
    </div>
  );
};

export default PostItem;
