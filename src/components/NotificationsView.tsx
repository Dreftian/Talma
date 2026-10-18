import React from 'react';
import { Heart, Repeat2, ShieldCheck, Database, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NotificationsViewProps {
  currentUser: UserProfile;
  onSelectProfile: (username: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
}) => {
  const notifications = [
    {
      id: 'notif_1',
      type: 'system',
      title: 'Sistema Talma',
      text: '¡Bienvenido Administrador! Tu cuenta está activa con acceso completo a Supabase Storage y Base de Datos.',
      time: '1m',
      icon: ShieldCheck,
      iconColor: 'text-[#22c55e]',
    },
    {
      id: 'notif_2',
      type: 'storage',
      title: 'Supabase Storage',
      text: 'El bucket "talma-media" está listo para subir fotos, videos de alta definición, audios y GIFs sin límites.',
      time: '15m',
      icon: Database,
      iconColor: 'text-[#22c55e]',
    },
    {
      id: 'notif_3',
      type: 'welcome',
      title: 'Talma Social',
      text: 'Talma es 100% gratuita y abierta. Sin muros de pago ni suscripciones VIP.',
      time: '1h',
      icon: Sparkles,
      iconColor: 'text-[#22c55e]',
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
