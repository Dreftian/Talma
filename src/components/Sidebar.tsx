import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Search,
  Bell,
  MessageCircle,
  Phone,
  Bookmark,
  User,
  MoreHorizontal,
  Feather,
  LogOut,
  CheckCircle2,
  Settings,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { TalmaLogo } from './TalmaLogo';
import { UserProfile } from '../types';
import { getStoredTheme, setAppTheme, AppTheme } from '../lib/theme';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile;
  onOpenComposer: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onSelectProfile: (username: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenComposer,
  onLogout,
  onSelectProfile,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(getStoredTheme());
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (t: AppTheme) => {
    setCurrentTheme(t);
    setAppTheme(t);
  };

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'explore', label: 'Explorar', icon: Search },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: 3 },
    { id: 'messages', label: 'Chat', icon: MessageCircle, badge: 1 },
    { id: 'calls', label: 'Llamadas', icon: Phone },
    { id: 'bookmarks', label: 'Historia', icon: Bookmark },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <header className="hidden sm:flex flex-col justify-between h-screen sticky top-0 px-2 sm:px-3 xl:px-4 py-2 select-none border-r border-[#2f3336] w-[68px] xl:w-[275px] shrink-0 z-30">
      {/* Top section: Logo and Nav items */}
      <div className="flex flex-col items-center xl:items-start gap-0.5">
        {/* Talma Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="p-3 hover:bg-white/[0.08] rounded-full cursor-pointer transition-colors duration-200 flex items-center gap-3 mb-1"
          title="Talma"
        >
          <TalmaLogo size="md" variant="icon" />
          <span className="hidden xl:inline font-black text-2xl tracking-tighter text-white italic">
            Talma
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-0.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentTab === item.id || (item.id === 'profile' && currentTab === 'profile');

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'profile') {
                    onSelectProfile(currentUser.username);
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-full hover:bg-white/[0.08] transition-all duration-150 group w-full xl:w-auto cursor-pointer ${
                  isActive ? 'font-bold text-white' : 'font-normal text-[#e7e9ea]'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white stroke-[2.6]' : 'text-[#e7e9ea]'
                    }`}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-[#1d9bf0] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline text-[19px] tracking-tight leading-6">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Más opciones Popover */}
          <div ref={moreMenuRef} className="relative w-full">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-full hover:bg-white/[0.08] transition-all duration-150 group w-full xl:w-auto cursor-pointer ${
                currentTab === 'settings' ? 'font-bold text-white' : 'font-normal text-[#e7e9ea]'
              }`}
            >
              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <span className="hidden xl:inline text-[19px] tracking-tight leading-6">
                Más opciones
              </span>
            </button>

            {showMoreMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-64 bg-black border border-[#2f3336] rounded-2xl shadow-2xl py-2 z-50 text-[15px] animate-pop-in">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onSelectTab('settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] text-left text-white transition-colors cursor-pointer"
                >
                  <Settings className="w-5 h-5 text-[#71767b]" />
                  <span>Configuración y privacidad</span>
                </button>

                {/* Theme Switcher in Popover */}
                <div className="border-t border-[#2f3336] px-4 py-2 mt-1">
                  <div className="text-xs font-bold text-[#71767b] mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Tema visual</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-[#16181c] p-1 rounded-xl border border-[#2f3336]">
                    <button
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        currentTheme === 'dark'
                          ? 'bg-black text-white border border-[#1d9bf0] shadow'
                          : 'text-[#71767b] hover:text-white'
                      }`}
                    >
                      Oscuro
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange('dim')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        currentTheme === 'dim'
                          ? 'bg-[#15202b] text-white border border-[#1d9bf0] shadow'
                          : 'text-[#71767b] hover:text-white'
                      }`}
                    >
                      Dim
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange('light')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        currentTheme === 'light'
                          ? 'bg-white text-black border border-[#1d9bf0] shadow'
                          : 'text-[#71767b] hover:text-white'
                      }`}
                    >
                      Claro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Big White Postear Button - Exact X Design */}
        <div className="w-full mt-3">
          <button
            onClick={onOpenComposer}
            className="w-full bg-white hover:bg-[#e6e6e6] text-black font-extrabold py-3.5 px-4 rounded-full text-base transition-all duration-200 shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Feather className="w-6 h-6 xl:hidden" />
            <span className="hidden xl:inline text-[17px] font-extrabold">Postear</span>
          </button>
        </div>
      </div>

      {/* Bottom section: User Profile Pill with menu */}
      <div ref={userMenuRef} className="relative w-full mb-2">
        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-3 w-72 bg-black border border-[#2f3336] rounded-2xl shadow-2xl p-2 z-50 animate-pop-in">
            <div className="p-3 border-b border-[#2f3336] flex items-center gap-3">
              <img
                src={currentUser.avatar_url || 'https://wmrvhihrwskuzoiifaug.supabase.co/storage/v1/object/public/talma-media/logo-talma.png'}
                alt={currentUser.display_name}
                className="w-10 h-10 rounded-full object-cover border border-[#2f3336]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 font-bold text-sm text-white truncate">
                  <span>{currentUser.display_name}</span>
                  {currentUser.is_verified && (
                    <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                  )}
                </div>
                <div className="text-xs text-[#71767b] truncate">@{currentUser.username}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowUserMenu(false);
                onSelectProfile(currentUser.username);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.08] rounded-xl text-left text-sm text-white transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#71767b]" />
              <span>Ver perfil</span>
            </button>

            <button
              onClick={() => {
                setShowUserMenu(false);
                onSelectTab('settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.08] rounded-xl text-left text-sm text-white transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#71767b]" />
              <span>Configuración</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl text-left text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer border-t border-[#2f3336] mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión de @{currentUser.username}</span>
              </button>
            )}
          </div>
        )}

        {/* Current User Card Pill */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center justify-between p-2.5 rounded-full hover:bg-white/[0.08] transition-colors duration-200 w-full group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={currentUser.avatar_url || 'https://wmrvhihrwskuzoiifaug.supabase.co/storage/v1/object/public/talma-media/logo-talma.png'}
              alt={currentUser.display_name}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#2f3336]"
            />
            <div className="hidden xl:flex flex-col min-w-0">
              <span className="font-bold text-[15px] text-white truncate leading-tight flex items-center gap-1">
                {currentUser.display_name}
                {currentUser.is_verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                )}
              </span>
              <span className="text-[13px] text-[#71767b] truncate">@{currentUser.username}</span>
            </div>
          </div>
          <MoreHorizontal className="hidden xl:block w-5 h-5 text-[#71767b] group-hover:text-white shrink-0" />
        </button>
      </div>
    </header>
  );
};
