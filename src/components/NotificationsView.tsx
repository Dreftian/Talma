import React from 'react';
import { Heart, Repeat2, UserPlus, MessageSquare, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NotificationsViewProps {
  currentUser: UserProfile;
  onSelectProfile: (username: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onSelectProfile,
}) => {
  const notifications = [
    {
      id: 'notif_1',
      type: 'like',
      actor: {
        username: 'talma_oficial',
        display_name: 'Talma Oficial',
        avatar_url: '/logo-talma.png',
      },
      text: 'le gustó tu publicación sobre la integración de Supabase Storage',
      time: '15m',
    },
    {
      id: 'notif_2',
      type: 'repost',
      actor: {
        username: 'supabase',
        display_name: 'Supabase',
        avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      },
      text: 'reposteó tu publicación',
      time: '1h',
    },
    {
      id: 'notif_3',
      type: 'follow',
      actor: {
        username: 'elonmusk',
        display_name: 'Elon Musk',
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
      },
      text: 'comenzó a seguirte en Talma',
      time: '3h',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
        <h1 className="font-extrabold text-xl text-white">Notificaciones</h1>
        <Sparkles className="w-5 h-5 text-[#22c55e]" />
      </div>

      <div className="flex border-b border-[#2f3336]">
        <button className="flex-1 py-3.5 text-center font-bold text-white relative hover:bg-[#181818] transition-colors">
          Todas
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-12 bg-[#22c55e] rounded-full" />
        </button>
        <button className="flex-1 py-3.5 text-center font-medium text-[#71767b] hover:bg-[#181818] transition-colors">
          Menciones
        </button>
      </div>

      {/* Notifications list */}
      <div className="flex flex-col">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onSelectProfile(notif.actor.username)}
            className="flex gap-4 px-6 py-4 border-b border-[#2f3336] hover:bg-[#080808] transition-colors cursor-pointer"
          >
            <div className="shrink-0 pt-0.5">
              {notif.type === 'like' && <Heart className="w-6 h-6 text-[#f91880] fill-[#f91880]" />}
              {notif.type === 'repost' && <Repeat2 className="w-6 h-6 text-[#00ba7c]" />}
              {notif.type === 'follow' && <UserPlus className="w-6 h-6 text-[#22c55e]" />}
              {notif.type === 'reply' && <MessageSquare className="w-6 h-6 text-[#1d9bf0]" />}
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <img
                src={notif.actor.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
              />
              <p className="text-[15px] text-[#e7e9ea] leading-normal">
                <span className="font-bold text-white hover:underline">
                  {notif.actor.display_name}
                </span>{' '}
                {notif.text}
              </p>
            </div>
            <span className="text-xs text-[#71767b]">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
