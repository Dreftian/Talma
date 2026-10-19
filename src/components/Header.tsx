import React, { useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { TalmaLogo } from './TalmaLogo';
import { UserProfile } from '../types';
import { getSafeAvatarUrl } from '../lib/avatar';

interface HeaderProps {
  activeTab: 'for_you' | 'following' | 'extalmita';
  onTabChange: (tab: 'for_you' | 'following' | 'extalmita') => void;
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
  const [showTabMenu, setShowTabMenu] = useState(false);

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
                  src={getSafeAvatarUrl(currentUser.avatar_url)}
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
      <div className="relative flex sm:hidden items-center justify-between px-4 pt-3 pb-2 border-b border-[#2f3336]/40">
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
              src={getSafeAvatarUrl(currentUser.avatar_url)}
              alt={currentUser.display_name}
              className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
            />
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}

        {/* Centered Airplane Logo - Exact X mobile app pattern */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <TalmaLogo size="md" variant="icon" />
        </div>
      </div>

      {/* Tabs: Para ti, Siguiendo, Extalmita */}
      <div className="flex w-full h-[53px]">
        <button
          onClick={() => onTabChange('for_you')}
          className="flex-1 min-w-0 flex justify-center items-center hover:bg-[#181818] transition-colors relative cursor-pointer"
        >
          <span
            className={`text-[15px] flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'for_you'
                ? 'font-bold text-white'
                : 'font-medium text-[#71767b]'
            }`}
          >
            Para ti
            {activeTab === 'for_you' && <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
          </span>
          {activeTab === 'for_you' && (
            <div className="absolute bottom-0 h-[4px] w-14 bg-[#1d9bf0] rounded-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('following')}
          className="flex-1 min-w-0 flex justify-center items-center hover:bg-[#181818] transition-colors relative cursor-pointer"
        >
          <span
            className={`text-[15px] flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'following'
                ? 'font-bold text-white'
                : 'font-medium text-[#71767b]'
            }`}
          >
            Siguiendo
            {activeTab === 'following' && <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
          </span>
          {activeTab === 'following' && (
            <div className="absolute bottom-0 h-[4px] w-16 bg-[#1d9bf0] rounded-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('extalmita')}
          className="flex-1 min-w-0 flex justify-center items-center hover:bg-[#181818] transition-colors relative cursor-pointer"
        >
          <span
            className={`text-[15px] flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'extalmita'
                ? 'font-bold text-white'
                : 'font-medium text-[#71767b]'
            }`}
          >
            <span>Extalmita</span>
            <span className="text-xs shrink-0">🌐</span>
            {activeTab === 'extalmita' && <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
          </span>
          {activeTab === 'extalmita' && (
            <div className="absolute bottom-0 h-[4px] w-20 bg-[#1d9bf0] rounded-full" />
          )}
        </button>

        {/* "+" tab to add/edit home tabs (refs 123123123.jpeg / 5.58.20 PM) */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowTabMenu((prev) => !prev)}
            className="h-full px-3 flex justify-center items-center hover:bg-[#181818] transition-colors cursor-pointer text-[#71767b] hover:text-white"
            title="Añadir o editar pestañas"
          >
            <Plus className="w-5 h-5" />
          </button>

          {showTabMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowTabMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-black border border-[#2f3336] rounded-2xl shadow-2xl py-1.5 z-40 animate-pop-in">
                <div className="px-4 py-2 text-[13px] font-bold text-[#71767b]">
                  Pestañas de inicio
                </div>
                {[
                  { id: 'for_you' as const, label: 'Para ti' },
                  { id: 'following' as const, label: 'Siguiendo' },
                  { id: 'extalmita' as const, label: 'Extalmita' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setShowTabMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-[15px] text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <span>{tab.label}</span>
                    {activeTab === tab.id && <Check className="w-4 h-4 text-[#1d9bf0]" />}
                  </button>
                ))}
                <div className="h-px bg-[#2f3336] my-1" />
                <button
                  onClick={() => {
                    onTabChange('for_you');
                    setShowTabMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#71767b]" />
                  <span>Restablecer pestañas</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
