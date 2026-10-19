import React, { useState } from 'react';
import {
  AtSign,
  BadgeCheck,
  Bell,
  Heart,
  MoreHorizontal,
  Repeat2,
  Settings,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { UserProfile } from '../types';
import { getSafeAvatarUrl } from '../lib/avatar';

interface NotificationsViewProps {
  currentUser: UserProfile;
  onSelectProfile: (username: string) => void;
  onOpenDrawer?: () => void;
}

type NotificationType = 'post' | 'follow' | 'mention' | 'like' | 'repost';

interface NotificationActor {
  name: string;
  handle: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

interface TalmaNotification {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  time: string;
  preview?: string;
}

/**
 * Forma laxa de una notificación: acepta tanto el shape futuro de la API
 * (actor/tipo/post/created_at) como los datos sembrados localmente. La API
 * todavía no expone notificaciones, así que la normalización vive aquí para
 * no tocar src/types/index.ts ni src/lib/api.ts.
 */
interface RawNotification {
  id?: string;
  type?: string;
  actor?: {
    name?: string;
    handle?: string;
    avatarUrl?: string;
    isVerified?: boolean;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  title?: string;
  text?: string;
  preview?: string;
  time?: string;
  created_at?: string;
  post?: { content?: string };
}

const NOTIFICATION_TYPES: NotificationType[] = ['post', 'follow', 'mention', 'like', 'repost'];

const NOTIFICATION_META: Record<
  NotificationType,
  { icon: typeof Sparkles; color: string }
> = {
  post: { icon: Sparkles, color: 'text-[#7856ff]' },
  follow: { icon: UserPlus, color: 'text-[#1d9bf0]' },
  mention: { icon: AtSign, color: 'text-[#1d9bf0]' },
  like: { icon: Heart, color: 'text-[#f91880]' },
  repost: { icon: Repeat2, color: 'text-[#00ba7c]' },
};

// Prefijo/sufijo del texto de cada fila, según 2.jpeg:
// "Post reciente de **Nombre** · 1 s" / "**Nombre** te siguió · 1 s".
const NOTIFICATION_ACTION: Record<NotificationType, { prefix: string; suffix: string }> = {
  post: { prefix: 'Post reciente de ', suffix: '' },
  follow: { prefix: '', suffix: ' te siguió' },
  mention: { prefix: '', suffix: ' te mencionó' },
  like: { prefix: '', suffix: ' le gustó tu post' },
  repost: { prefix: '', suffix: ' reposteó tu post' },
};

// La ref muestra tiempos con espacio ("1 s"); formatRelativeTime de utils
// devuelve "1s", así que formateamos localmente.
const formatNotificationTime = (createdAt?: string): string => {
  if (!createdAt) return 'ahora';
  const timestamp = new Date(createdAt).getTime();
  if (Number.isNaN(timestamp)) return createdAt;
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds} s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} d`;
  return new Date(timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const resolveNotificationType = (rawType?: string): NotificationType => {
  if (rawType && NOTIFICATION_TYPES.includes(rawType as NotificationType)) {
    return rawType as NotificationType;
  }
  // NotificationItem usa "reply" para respuestas: lo mostramos como mención.
  if (rawType === 'reply') return 'mention';
  return 'post';
};

const normalizeNotification = (
  raw: RawNotification,
  index: number,
  fallbackActor: NotificationActor
): TalmaNotification => ({
  id: raw.id || `notif_${index + 1}`,
  type: resolveNotificationType(raw.type),
  actor: {
    name: raw.actor?.name || raw.actor?.display_name || raw.title || fallbackActor.name,
    handle: raw.actor?.handle || raw.actor?.username || fallbackActor.handle,
    avatarUrl: raw.actor?.avatarUrl || raw.actor?.avatar_url || fallbackActor.avatarUrl,
    isVerified: raw.actor?.isVerified ?? raw.actor?.is_verified ?? fallbackActor.isVerified,
  },
  time: raw.time || formatNotificationTime(raw.created_at),
  preview: raw.preview || raw.post?.content || raw.text,
});

// Notificaciones limpias para estado inicial / app nueva
const SEEDED_NOTIFICATIONS: RawNotification[] = [];

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
  onSelectProfile,
  onOpenDrawer,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'mentions'>('all');

  const currentUserActor: NotificationActor = {
    name: currentUser.display_name || currentUser.username,
    handle: currentUser.username,
    avatarUrl: currentUser.avatar_url,
    isVerified: currentUser.is_verified,
  };

  const notifications = SEEDED_NOTIFICATIONS.map((item, index) =>
    normalizeNotification(item, index, currentUserActor)
  );

  const visibleNotifications = notifications.filter((item) => {
    if (activeTab === 'mentions') return item.type === 'mention';
    if (activeTab === 'verified') return item.actor.isVerified;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
        {/* Mobile avatar (opens the slide-out drawer, X app style) */}
        <button
          onClick={() => (onOpenDrawer ? onOpenDrawer() : onSelectProfile(currentUser.username))}
          className="sm:hidden shrink-0 rounded-full active:scale-95 transition-transform"
          title="Abrir menú"
        >
          <img
            src={getSafeAvatarUrl(currentUser.avatar_url)}
            alt={currentUser.display_name}
            className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
          />
        </button>

        <h1 className="font-extrabold text-xl text-white sm:static absolute left-1/2 -translate-x-1/2 sm:translate-x-0">
          Notificaciones
        </h1>

        <button className="p-2 -mr-2 text-[#71767b] hover:text-white hover:bg-[#181818] rounded-full transition-colors cursor-pointer">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-[#2f3336]">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'mentions', label: 'Menciones' },
          { id: 'verified', label: 'Verificado' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'all' | 'verified' | 'mentions')}
            className="flex-1 py-3.5 text-center relative hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <span
              className={`inline-flex items-center justify-center gap-1.5 text-[15px] ${
                activeTab === tab.id
                  ? 'font-bold text-white'
                  : 'font-medium text-[#71767b]'
              }`}
            >
              {/* La ref 2.jpeg muestra la campana solo en la pestaña activa "Todas" */}
              {tab.id === 'all' && activeTab === 'all' && (
                <Bell className="w-[18px] h-[18px] text-white" />
              )}
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-14 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        {visibleNotifications.map((item) => {
          const { icon: Icon, color } = NOTIFICATION_META[item.type];
          const { prefix, suffix } = NOTIFICATION_ACTION[item.type];
          const avatar = getSafeAvatarUrl(item.actor.avatarUrl);
          return (
            <div
              key={item.id}
              className="px-4 py-4 border-b border-[#2f3336] hover:bg-[#16181c] transition-colors flex items-start gap-3"
            >
              {/* Icono pequeño del tipo de notificación (destello morado / persona azul) */}
              <div className="w-5 shrink-0 flex justify-center pt-2">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>

              {/* Avatar del actor */}
              <img
                src={avatar}
                alt={item.actor.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />

              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="text-[15px] leading-5 text-[#e7e9ea]">
                  {prefix}
                  <span className="font-bold text-white">{item.actor.name}</span>
                  {item.actor.isVerified && (
                    <BadgeCheck className="inline-block w-[18px] h-[18px] ml-0.5 -mt-0.5 text-[#1d9bf0]" />
                  )}
                  {suffix}
                  <span className="text-[#71767b]"> · {item.time}</span>
                </p>
                {item.preview && (
                  <p className="text-[15px] leading-5 text-[#71767b] line-clamp-2">
                    {item.preview}
                  </p>
                )}
              </div>

              <button
                className="p-1.5 -mr-1.5 -mt-0.5 shrink-0 text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer"
                title="Más opciones"
              >
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
            </div>
          );
        })}

        {visibleNotifications.length === 0 && (
          <div className="px-8 py-20 text-center max-w-sm mx-auto flex flex-col items-center justify-center">
            <h2 className="text-[28px] sm:text-[31px] font-extrabold text-white tracking-tight leading-tight mb-2">
              Nada que ver aquí... todavía
            </h2>
            <p className="text-[15px] text-[#71767b] leading-relaxed">
              {activeTab === 'mentions'
                ? 'Cuando alguien te mencione en una publicación o respuesta, la verás aquí.'
                : activeTab === 'verified'
                ? 'Las notificaciones de personas verificadas aparecerán aquí.'
                : 'De "Me gusta" y reposts a respuestas y mucho más, aquí es donde verás toda la actividad de tus publicaciones y tu cuenta.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
