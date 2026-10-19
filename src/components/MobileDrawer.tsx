import React, { useState } from 'react';
import {
  X,
  User,
  Users,
  Bookmark,
  List,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  CheckCircle2,
  UserPlus,
  Mic2,
  Sparkles,
  Rocket,
  Lock,
  BadgeCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { getStoredTheme, setAppTheme, AppTheme } from '../lib/theme';
import { getSafeAvatarUrl } from '../lib/avatar';

/** La API puede devolver el flag de cuenta protegida aunque el tipo global no lo declare. */
type ProfileWithPrivacy = UserProfile & { is_protected?: boolean };

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectTab: (tab: string) => void;
  onSelectProfile: (username: string) => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onOpenArticles?: () => void;
  onOpenCommunities?: () => void;
  onOpenFollowRequests?: () => void;
  onOpenAi?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectTab,
  onSelectProfile,
  onOpenAuth,
  onLogout,
  onOpenArticles,
  onOpenCommunities,
  onOpenFollowRequests,
  onOpenAi,
}) => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(getStoredTheme());
  const isProtected = Boolean((currentUser as ProfileWithPrivacy).is_protected);

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
              src={getSafeAvatarUrl(currentUser.avatar_url)}
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
              {isProtected && (
                <Lock className="w-4 h-4 text-[#e7e9ea] shrink-0" aria-label="Cuenta protegida" />
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

          {/* Navigation Items — orden exacto de las refs 4.jpeg & 5.jpeg */}
          <nav className="flex flex-col gap-0.5">
            {/* 1. Perfil */}
            <button
              onClick={() => {
                onSelectProfile(currentUser.username);
                onClose();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[17px] font-bold cursor-pointer text-left"
            >
              <User className="w-5 h-5 text-[#e7e9ea]" />
              <span>Perfil</span>
            </button>

            {/* 2. Premium + píldora "50% de descuento" */}
            <button
              onClick={() => {
                onSelectTab('settings');
                onClose();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[17px] font-bold cursor-pointer text-left"
            >
              <BadgeCheck className="w-5 h-5 text-[#e7e9ea]" />
              <span className="flex items-center gap-2 min-w-0">
                <span>Premium</span>
                <span className="shrink-0 bg-[#1d9bf0] text-white text-[11px] font-bold leading-none rounded-full px-2 py-1">
                  50% de descuento
                </span>
              </span>
            </button>

            {/* 3. Comunidades */}
            <button
              onClick={() => {
                onClose();
                if (onOpenCommunities) onOpenCommunities();
                else onSelectTab('extalmita');
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[17px] font-bold cursor-pointer text-left"
            >
              <Users className="w-5 h-5 text-[#e7e9ea]" />
              <span>Comunidades</span>
            </button>

            {/* 4. Guardados */}
            <button
              onClick={() => {
                onSelectTab('bookmarks');
                onClose();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[17px] font-bold cursor-pointer text-left"
            >
              <Bookmark className="w-5 h-5 text-[#e7e9ea]" />
              <span>Guardados</span>
            </button>

            {/* 5. Listas */}
            <button
              onClick={() => {
                onSelectTab('home');
                onClose();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[17px] font-bold cursor-pointer text-left"
            >
              <List className="w-5 h-5 text-[#e7e9ea]" />
              <span>Listas</span>
            </button>

            {/* 6. Espacios (ref 4.jpeg / 5.jpeg) */}
            <button
              onClick={() => onClose()}
              title="Espacios"
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[17px] font-bold cursor-pointer text-left"
            >
              <Mic2 className="w-5 h-5 text-[#e7e9ea]" />
              <span>Espacios</span>
            </button>

            {/* 7. Solicitudes de seguimiento */}
            <button
              onClick={() => {
                onClose();
                if (onOpenFollowRequests) onOpenFollowRequests();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[17px] font-bold cursor-pointer text-left"
            >
              <UserPlus className="w-5 h-5 text-[#e7e9ea]" />
              <span>Solicitudes de seguimiento</span>
            </button>

            {/* 8. Estudio para creadores (abre el estudio de artículos/borradores) */}
            <button
              onClick={() => {
                onClose();
                if (onOpenArticles) onOpenArticles();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-white hover:bg-white/[0.04] transition-colors text-[17px] font-bold cursor-pointer text-left"
            >
              <Rocket className="w-5 h-5 text-[#e7e9ea]" />
              <span>Estudio para creadores</span>
            </button>
          </nav>

          <div className="h-px bg-[#2f3336] my-3" />

          {/* Bloque de iconos pequeños: icono 18px + label 15px normal (ref 5.jpeg) */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                onClose();
                onOpenAi?.();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-[15px] font-normal text-[#e7e9ea] hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
            >
              <Sparkles className="w-[18px] h-[18px] text-[#71767b] shrink-0" />
              <span>Abrir Talma AI</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('settings');
                onClose();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-[15px] font-normal text-[#e7e9ea] hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
            >
              <Settings className="w-[18px] h-[18px] text-[#71767b] shrink-0" />
              <span>Configuración y privacidad</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('settings');
                onClose();
              }}
              className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-[15px] font-normal text-[#e7e9ea] hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
            >
              <HelpCircle className="w-[18px] h-[18px] text-[#71767b] shrink-0" />
              <span>Centro de Ayuda</span>
            </button>
          </div>
        </div>

        {/* Bloque inferior: icono 18px + label 15px normal (ref 5.jpeg) */}
        <div className="flex flex-col gap-1 pt-3 border-t border-[#2f3336]">
          <button
            onClick={cycleTheme}
            title={`Tema actual: ${currentTheme}`}
            className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-[15px] font-normal text-[#e7e9ea] hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
          >
            {currentTheme === 'light' ? (
              <Sun className="w-[18px] h-[18px] text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-[#e7e9ea] shrink-0" />
            )}
            <span>{currentTheme === 'light' ? 'Tema claro' : currentTheme === 'dim' ? 'Tema tenue' : 'Tema oscuro'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
              else onOpenAuth();
            }}
            className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-[15px] font-normal text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
