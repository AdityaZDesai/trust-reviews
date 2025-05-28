// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, LayoutGrid, ListOrdered } from 'lucide-react';
import DashboardOverview from '@/components/dashboard/main/DashboardOverview';
import PostsListing from '@/components/dashboard/post/PostsListing';
import TrustReviewsLogo from '@/components/misc/TrustReviewsLogo';

interface DashboardData {
  commissionBySource: { source: string; commission: number }[];
  totalCommission: number;
  todayCount: number;
  sourceCounts: { source: string; count: number }[];
  listings: any[];
  deletedReviewsCount: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts'>('dashboard');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Data state
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard + listings
  useEffect(() => {
    if (!user?.email) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard?email=${encodeURIComponent(user.email ?? '')}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || res.statusText);
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email]);

  // Window resize for responsive labels
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const showLabels = windowWidth > 640;
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'posts',     label: 'Listings',  icon: ListOrdered }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-seasalt px-4 sm:px-8 md:px-16 lg:px-24 py-6 sm:py-8 md:py-10 lg:py-12">
      <header className="px-0 sm:px-4 py-4">
        {/* Desktop Header */}
        <div className="hidden sm:flex flex-row items-center justify-between w-full">
          <div className="flex items-center">
            <TrustReviewsLogo />
          </div>
          <div
            className="flex flex-row justify-center rounded-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mx-8"
            style={{ background: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "dashboard" | "posts")}
                  className={`
                    flex items-center gap-2 px-4 sm:px-8 py-2 sm:py-3
                    text-base sm:text-lg font-semibold transition-all duration-200
                    focus:outline-none whitespace-nowrap
                    ${isActive ? 'bg-dark-slate-gray text-white' : 'bg-sgbus-green text-eerie-black hover:bg-sgbus-green/90'}
                    ${idx === 0 ? 'rounded-l-full' : 'rounded-r-full'}
                  `}
                  style={{ border: 'none' }}
                >
                  <Icon
                    size={20}
                    strokeWidth={2.2}
                    className={isActive ? 'text-sgbus-green' : 'text-eerie-black'}
                  />
                  {showLabels && <span>{tab.label}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center space-x-2 dropdown-container">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback className="bg-amber-500 text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="relative dropdown-container">
              <ChevronDown
                className="h-4 w-4 text-gray-500 cursor-pointer"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex flex-col sm:hidden w-full">
          <div className="flex flex-row w-full items-center justify-between">
            <TrustReviewsLogo />
            <div className="flex items-center space-x-2 dropdown-container">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-amber-500 text-white">
                  U
                </AvatarFallback>
              </Avatar>
              <ChevronDown
                className="h-4 w-4 text-gray-500 cursor-pointer"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="absolute right-4 mt-16 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div
            className="flex flex-row w-full justify-center mt-4 rounded-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            style={{ background: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-4 py-2
                    text-base font-semibold transition-all duration-200
                    focus:outline-none whitespace-nowrap
                    ${isActive ? 'bg-dark-slate-gray text-white' : 'bg-sgbus-green text-eerie-black hover:bg-sgbus-green/90'}
                    ${idx === 0 ? 'rounded-l-full' : 'rounded-r-full'}
                  `}
                  style={{ border: 'none' }}
                >
                  <Icon
                    size={20}
                    strokeWidth={2.2}
                    className={isActive ? 'text-sgbus-green' : 'text-eerie-black'}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>


      
      <div className="px-0 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && <DashboardOverview onNavigateToListings={() => setActiveTab('posts')} />}
        {activeTab === 'posts' && <PostsListing />}
      </div>
    </div>
  );
}
