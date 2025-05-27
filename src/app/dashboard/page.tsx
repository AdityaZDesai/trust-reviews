"use client"

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, LayoutGrid, ListOrdered } from 'lucide-react';
import DashboardOverview from '@/components/dashboard/main/DashboardOverview';
import PostsListing from '@/components/dashboard/post/PostsListing';
import TrustReviewsLogo from '@/components/misc/TrustReviewsLogo';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'posts', label: 'Listings', icon: ListOrdered }
  ];

  return (
    <div className="min-h-screen bg-seasalt px-4 sm:px-8 md:px-16 lg:px-24 py-6 sm:py-8 md:py-10 lg:py-12">
      <header className="px-0 sm:px-4 py-4">
        {/* Desktop: all in a row */}
        <div className="hidden sm:flex flex-row items-center justify-between w-full">
          <div className="flex items-center">
            <TrustReviewsLogo />
          </div>
          <div className="flex flex-row justify-center rounded-full overflow-x-auto bg-transparent scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mx-8" style={{ background: 'none', WebkitOverflowScrolling: 'touch' }}>
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    'flex items-center gap-2 px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold transition-all duration-200 focus:outline-none whitespace-nowrap ' +
                    (isActive
                      ? 'bg-dark-slate-gray text-white'
                      : 'bg-sgbus-green text-eerie-black hover:bg-sgbus-green/90') +
                    (idx === 0 ? ' rounded-l-full' : ' rounded-r-full')
                  }
                  style={{ border: 'none' }}
                >
                  <Icon className={isActive ? 'text-sgbus-green' : 'text-eerie-black'} size={20} strokeWidth={2.2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback className="bg-amber-500 text-white">U</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        {/* Mobile: logo & avatar row, nav tabs below */}
        <div className="flex flex-col sm:hidden w-full">
          <div className="flex flex-row w-full items-center justify-between">
            <div className="flex justify-start">
              <TrustReviewsLogo />
            </div>
            <div className="flex items-center space-x-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-amber-500 text-white">U</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div className="flex flex-row w-full justify-center mt-4 rounded-full overflow-x-auto bg-transparent scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" style={{ background: 'none', WebkitOverflowScrolling: 'touch' }}>
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    'flex items-center gap-2 px-4 py-2 text-base font-semibold transition-all duration-200 focus:outline-none whitespace-nowrap ' +
                    (isActive
                      ? 'bg-dark-slate-gray text-white'
                      : 'bg-sgbus-green text-eerie-black hover:bg-sgbus-green/90') +
                    (idx === 0 ? ' rounded-l-full' : ' rounded-r-full')
                  }
                  style={{ border: 'none' }}
                >
                  <Icon className={isActive ? 'text-sgbus-green' : 'text-eerie-black'} size={20} strokeWidth={2.2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="px-0 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'posts' && <PostsListing />}
      </div>
    </div>
  );
} 