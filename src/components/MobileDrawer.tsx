import React from 'react';
import {
  X,
  User,
  Bookmark,
  Bell,
  Mail,
  Search,
  Settings,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out drawer menu */}
      <div className="relative w-[300px] max-w-[85vw] h-full bg-black border-r border-[#2f3336] flex flex-col justify-between p-5 z-50 overflow-y-auto animate-slide-right select-none shadow-2xl">
        {/* Top: Header with User Details */}
        <div className="flex flex-col">
          {/* Top row: Avatar & Close button */}
          <div className="flex items-center justify-between mb-3">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.display_name}
              className="w-12 h-12 rounded-full object-cover border border-[#2f3336]"
              onClick={() => {
                onSelectProfile(currentUser.username);
                onClose();
              }}
            />
            <button
              onClick={onClose}
              className="p-2 text-[#71767b] hover:text-white rounded-full hover:bg-[#181818] transition-colors"
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

          {/* Navigation Items - Exact X mobile style */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => {
                onSelectProfile(currentUser.username);
                onClose();
              }}
              className="flex items-center gap-4 py-3 px-2 rounded-xl text-white hover:bg-[#181818] transition-colors text-lg font-bold"
            >
              <User className="w-6 h-6 text-[#e7e9ea]" />
              <span>Perfil</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('bookmarks');
                onClose();
              }}
              className="flex items-center gap-4 py-3 px-2 rounded-xl text-white hover:bg-[#181818] transition-colors text-lg font-bold"
            >
              <Bookmark className="w-6 h-6 text-[#e7e9ea]" />
              <span>Guardados</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('explore');
                onClose();
              }}
              className="flex items-center gap-4 py-3 px-2 rounded-xl text-white hover:bg-[#181818] transition-colors text-lg font-bold"
            >
              <Search className="w-6 h-6 text-[#e7e9ea]" />
              <span>Explorar</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('notifications');
                onClose();
              }}
              className="flex items-center gap-4 py-3 px-2 rounded-xl text-white hover:bg-[#181818] transition-colors text-lg font-bold"
            >
              <Bell className="w-6 h-6 text-[#e7e9ea]" />
              <span>Notificaciones</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('messages');
                onClose();
              }}
              className="flex items-center gap-4 py-3 px-2 rounded-xl text-white hover:bg-[#181818] transition-colors text-lg font-bold"
            >
              <Mail className="w-6 h-6 text-[#e7e9ea]" />
              <span>Mensajes</span>
            </button>
          </nav>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#2f3336]">
          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 rounded-xl text-xs text-[#1d9bf0] font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Cuenta Verificada</span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
              else onOpenAuth();
            }}
            className="flex items-center gap-3 py-2.5 px-2 rounded-xl text-red-400 hover:bg-[#181818] transition-colors text-base font-semibold cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>

          <span className="text-[11px] text-[#71767b] px-2 pt-1">
            Talma Social
          </span>
        </div>
      </div>
    </div>
  );
};
