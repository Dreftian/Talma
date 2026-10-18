import React, { useState } from 'react';
import { Settings, Sparkles, UserPlus, Heart, MessageSquare, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface NotificationsViewProps {
  currentUser: UserProfile;
  onSelectProfile: (username: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'mentions'>('all');

  const notifications = [
    {
      id: 'notif_1',
      type: 'system',
      title: 'Bienvenido a Talma',
      text: 'Explora lo que está pasando en el mundo, comparte ideas con fotos, videos y audios al instante.',
      time: '1h',
      icon: Sparkles,
      iconColor: 'text-[#1d9bf0]',
    },
    {
      id: 'notif_2',
      type: 'account',
      title: 'Cuenta activa',
      text: `@${currentUser.username}, tu perfil está completamente configurado y listo para interactuar.`,
      time: '3h',
      icon: CheckCircle2,
      iconColor: 'text-[#1d9bf0]',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
        <h1 className="font-extrabold text-xl text-white">Notificaciones</h1>
        <button className="p-2 -mr-2 text-[#71767b] hover:text-white hover:bg-[#181818] rounded-full transition-colors cursor-pointer">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-[#2f3336]">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'verified', label: 'Verificadas' },
          { id: 'mentions', label: 'Menciones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 py-3.5 text-center relative hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <span
              className={`text-[15px] ${
                activeTab === tab.id
                  ? 'font-bold text-white'
                  : 'font-medium text-[#71767b]'
              }`}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-14 bg-[#1d9bf0] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        {notifications.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 border-b border-[#2f3336] hover:bg-[#16181c] transition-colors flex gap-4 items-start"
            >
              <div className="p-2 rounded-full bg-[#181818] border border-[#2f3336] shrink-0 mt-0.5">
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[15px] text-white">{item.title}</span>
                  <span className="text-xs text-[#71767b]">{item.time}</span>
                </div>
                <p className="text-sm text-[#e7e9ea] leading-relaxed">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
