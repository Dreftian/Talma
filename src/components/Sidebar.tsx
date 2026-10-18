import React from 'react';
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  MoreHorizontal,
  Feather,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { TalmaLogo } from './TalmaLogo';
import { UserProfile } from '../types';

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
  onOpenAuth,
  onLogout,
  onSelectProfile,
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'explore', label: 'Explorar', icon: Search },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: 3 },
    { id: 'messages', label: 'Mensajes', icon: Mail, badge: 1 },
    { id: 'bookmarks', label: 'Guardados', icon: Bookmark },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <header className="hidden sm:flex flex-col justify-between h-screen sticky top-0 px-2 sm:px-4 md:px-6 py-3 select-none border-r border-[#2f3336] w-[68px] xl:w-[275px] shrink-0">
      {/* Top section: Logo and Nav items */}
      <div className="flex flex-col items-center xl:items-start gap-1">
        {/* Talma Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="p-3 hover:bg-[#181818] rounded-full cursor-pointer transition-colors duration-200 flex items-center gap-3 mb-1"
          title="Talma"
        >
          <TalmaLogo size="md" variant="icon" />
          <span className="hidden xl:inline font-black text-2xl tracking-tighter text-white italic">
            Talma
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1 w-full">
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
                className={`flex items-center gap-5 p-3 rounded-full hover:bg-[#181818] transition-all duration-200 group w-full xl:w-auto ${
                  isActive ? 'font-bold text-white' : 'font-normal text-[#e7e9ea]'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-7 h-7 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white stroke-[2.5]' : 'text-[#e7e9ea]'
                    }`}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-[#22c55e] text-black text-[11px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline text-xl tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Postear Button */}
        <div className="w-full mt-4">
          <button
            onClick={onOpenComposer}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold py-3.5 px-4 rounded-full text-base transition-all duration-200 shadow-md shadow-green-950/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Feather className="w-6 h-6 xl:hidden" />
            <span className="hidden xl:inline text-[17px]">Postear</span>
          </button>
        </div>
      </div>

      {/* Bottom section: Current User Card */}
      <div className="relative w-full mb-1">
        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-3 w-64 bg-black border border-[#2f3336] rounded-2xl shadow-2xl py-2 z-50 animate-pop-in">
            <button
              onClick={() => {
                setShowUserMenu(false);
                onOpenAuth();
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#16181c] flex items-center gap-3 text-[15px] font-semibold text-[#e7e9ea] transition-colors"
            >
              <span>Cambiar de cuenta / Acceder</span>
            </button>
            <div className="h-px bg-[#2f3336] my-1" />
            <button
              onClick={() => {
                setShowUserMenu(false);
                if (onLogout) onLogout();
                else onOpenAuth();
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#16181c] flex items-center gap-3 text-[15px] font-semibold text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión de @{currentUser.username}</span>
            </button>
          </div>
        )}

        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center justify-between p-2.5 rounded-full hover:bg-[#181818] cursor-pointer transition-colors duration-200 w-full"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.display_name}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#2f3336]"
            />
            <div className="hidden xl:flex flex-col leading-tight overflow-hidden text-left">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[15px] text-white truncate max-w-[120px]">
                  {currentUser.display_name}
                </span>
                {currentUser.is_verified && (
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] fill-[#22c55e] stroke-black shrink-0" />
                )}
              </div>
              <span className="text-sm text-[#71767b] truncate">
                @{currentUser.username}
              </span>
            </div>
          </div>
          <MoreHorizontal className="hidden xl:inline w-5 h-5 text-[#71767b] shrink-0" />
        </div>
      </div>
    </header>
  );
};
