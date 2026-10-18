import React from 'react';
import { Sparkles } from 'lucide-react';
import { TalmaLogo } from './TalmaLogo';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'for_you' | 'following';
  onTabChange: (tab: 'for_you' | 'following') => void;
  title?: string;
  onBack?: () => void;
  currentUser?: UserProfile;
  onSelectProfile?: (username: string) => void;
  onOpenDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  title,
  onBack,
  currentUser,
  onSelectProfile,
  onOpenDrawer,
}) => {
  if (title) {
    return (
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
        <div className="flex items-center">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 mr-4 rounded-full hover:bg-[#181818] transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-5 h-5 fill-current text-[#e7e9ea]"
              >
                <g>
                  <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
                </g>
              </svg>
            </button>
          ) : (
            currentUser && onOpenDrawer && (
              <button
                onClick={onOpenDrawer}
                className="sm:hidden p-1 mr-3 rounded-full hover:opacity-80 transition-opacity"
              >
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.display_name}
                  className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
                />
              </button>
            )
          )}
          <h1 className="font-bold text-xl text-[#e7e9ea] truncate">{title}</h1>
        </div>
        <div className="sm:hidden">
          <TalmaLogo size="sm" variant="icon" />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336]">
      {/* Mobile-only header (top bar on small screens - Exact X App UI) */}
      <div className="flex sm:hidden items-center justify-between px-4 pt-3 pb-2 border-b border-[#2f3336]/40">
        {currentUser ? (
          <button
            onClick={() => {
              if (onOpenDrawer) onOpenDrawer();
              else if (onSelectProfile) onSelectProfile(currentUser.username);
            }}
            className="shrink-0 rounded-full hover:opacity-80 transition-opacity active:scale-95"
            title="Abrir menú"
          >
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.display_name}
              className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
            />
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}

        <div className="flex items-center gap-1.5">
          <TalmaLogo size="sm" variant="icon" />
          <span className="font-black text-xl italic text-white tracking-tighter">
            Talma
          </span>
        </div>

        <button className="text-[#71767b] hover:text-[#22c55e] p-1 transition-colors">
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs: Para ti & Siguiendo */}
      <div className="flex w-full h-[53px]">
        <button
          onClick={() => onTabChange('for_you')}
          className="flex-1 flex justify-center items-center hover:bg-[#181818] transition-colors relative cursor-pointer"
        >
          <span
            className={`text-[15px] ${
              activeTab === 'for_you'
                ? 'font-bold text-white'
                : 'font-medium text-[#71767b]'
            }`}
          >
            Para ti
          </span>
          {activeTab === 'for_you' && (
            <div className="absolute bottom-0 h-[4px] w-14 bg-[#22c55e] rounded-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('following')}
          className="flex-1 flex justify-center items-center hover:bg-[#181818] transition-colors relative cursor-pointer"
        >
          <span
            className={`text-[15px] ${
              activeTab === 'following'
                ? 'font-bold text-white'
                : 'font-medium text-[#71767b]'
            }`}
          >
            Siguiendo
          </span>
          {activeTab === 'following' && (
            <div className="absolute bottom-0 h-[4px] w-16 bg-[#22c55e] rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
};
