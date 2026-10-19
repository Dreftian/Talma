import React, { useState } from 'react';
import {
  X,
  User,
  Users,
  Bookmark,
  List,
  Radio,
  Coins,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { getStoredTheme, setAppTheme, AppTheme } from '../lib/theme';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectTab: (tab: string) => void;
  onSelectProfile: (username: string) => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectTab,
  onSelectProfile,
  onOpenAuth,
  onLogout,
}) => {
  const [configOpen, setConfigOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(getStoredTheme());

  if (!isOpen) return null;

  const cycleTheme = () => {
    const nextTheme: AppTheme =
      currentTheme === 'dark' ? 'dim' : currentTheme === 'dim' ? 'light' : 'dark';
    setCurrentTheme(nextTheme);
    setAppTheme(nextTheme);
  };

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out drawer menu (matches 4.jpeg & 5.jpeg) */}
      <div className="relative w-[300px] max-w-[85vw] h-full bg-black border-r border-[#2f3336] flex flex-col justify-between p-5 z-50 overflow-y-auto animate-slide-right select-none shadow-2xl">
        {/* Top: Header with User Details */}
        <div className="flex flex-col">
          {/* Top row: Avatar & Close button */}
          <div className="flex items-center justify-between mb-3">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.display_name}
              className="w-10 h-10 rounded-full object-cover border border-[#2f3336] cursor-pointer"
              onClick={() => {
                onSelectProfile(currentUser.username);
                onClose();
              }}
            />
            <button
              onClick={onClose}
              className="p-2 text-[#71767b] hover:text-white rounded-full hover:bg-[#181818] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Display Info */}
          <div
            className="flex flex-col cursor-pointer"
            onClick={() => {
              onSelectProfile(currentUser.username);
              onClose();
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[17px] text-white">
                {currentUser.display_name}
              </span>
              {currentUser.is_verified && (
                <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
              )}
            </div>
            <span className="text-sm text-[#71767b]">@{currentUser.username}</span>
          </div>

          {/* Follow stats */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-[#71767b]">
              <strong className="text-white font-bold">{currentUser.following_count}</strong> Siguiendo
            </span>
            <span className="text-[#71767b]">
              <strong className="text-white font-bold">{currentUser.followers_count}</strong> Seguidores
            </span>
          </div>

          <div className="h-px bg-[#2f3336] my-4" />

          {/* Navigation Items - Exact X mobile style (matches 4.jpeg & 5.jpeg) */}
          <nav className="flex flex-col gap-1">
            {/* 1. Perfil */}
            <button
              onClick={() => {
                onSelectProfile(currentUser.username);
                onClose();
              }}
              className="flex items-center gap-5 py-3 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[19px] font-extrabold cursor-pointer text-left"
            >
              <User className="w-6 h-6 text-[#e7e9ea]" />
              <span>Perfil</span>
            </button>

            {/* 2. Comunidades */}
            <button
              onClick={() => {
                onSelectTab('extalmita');
                onClose();
              }}
              className="flex items-center gap-5 py-3 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[19px] font-extrabold cursor-pointer text-left"
            >
              <Users className="w-6 h-6 text-[#e7e9ea]" />
              <span>Comunidades</span>
            </button>

            {/* 3. Guardados */}
            <button
              onClick={() => {
                onSelectTab('bookmarks');
                onClose();
              }}
              className="flex items-center gap-5 py-3 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[19px] font-extrabold cursor-pointer text-left"
            >
              <Bookmark className="w-6 h-6 text-[#e7e9ea]" />
              <span>Guardados</span>
            </button>

            {/* 4. Listas */}
            <button
              onClick={() => {
                onSelectTab('home');
                onClose();
              }}
              className="flex items-center gap-5 py-3 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[19px] font-extrabold cursor-pointer text-left"
            >
              <List className="w-6 h-6 text-[#e7e9ea]" />
              <span>Listas</span>
            </button>

            {/* 5. Espacios */}
            <button
              onClick={() => {
                onSelectTab('home');
                onClose();
              }}
              className="flex items-center gap-5 py-3 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[19px] font-extrabold cursor-pointer text-left"
            >
              <Radio className="w-6 h-6 text-[#e7e9ea]" />
              <span>Espacios</span>
            </button>

            {/* 6. Monetización */}
            <button
              onClick={() => {
                onSelectTab('settings');
                onClose();
              }}
              className="flex items-center gap-5 py-3 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[19px] font-extrabold cursor-pointer text-left"
            >
              <Coins className="w-6 h-6 text-[#e7e9ea]" />
              <span>Monetización</span>
            </button>
          </nav>

          <div className="h-px bg-[#2f3336] my-3" />

          {/* Configuración y soporte Accordion (matches 4.jpeg & 5.jpeg) */}
          <div className="flex flex-col">
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="flex items-center justify-between py-3 px-2 text-[15px] font-bold text-white hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer"
            >
              <span>Configuración y soporte</span>
              {configOpen ? (
                <ChevronUp className="w-5 h-5 text-[#71767b]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#71767b]" />
              )}
            </button>

            {configOpen && (
              <div className="flex flex-col pl-2 gap-1 animate-fadeIn">
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    onClose();
                  }}
                  className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-[15px] text-[#e7e9ea] hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-5 h-5 text-[#71767b]" />
                  <span>Configuración y privacidad</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('settings');
                    onClose();
                  }}
                  className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-[15px] text-[#e7e9ea] hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                >
                  <HelpCircle className="w-5 h-5 text-[#71767b]" />
                  <span>Centro de Ayuda</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Drawer Actions (Theme icon on bottom left matching 4.jpeg) */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2f3336]">
          <button
            onClick={cycleTheme}
            title={`Tema actual: ${currentTheme}`}
            className="p-2.5 rounded-full hover:bg-white/10 text-[#71767b] hover:text-white transition-colors cursor-pointer"
          >
            {currentTheme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
              else onOpenAuth();
            }}
            className="flex items-center gap-2 py-1.5 px-3 rounded-full text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
