import React, { useState } from 'react';
import { X, UserCheck, UserX, CheckCircle2, Shield } from 'lucide-react';
import { UserProfile } from '../types';
import { getSafeAvatarUrl } from '../lib/avatar';

interface FollowRequest {
  id: string;
  user: {
    username: string;
    display_name: string;
    avatar_url: string;
    bio: string;
    is_verified?: boolean;
  };
  time: string;
}

interface FollowRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

const INITIAL_REQUESTS: FollowRequest[] = [
  {
    id: 'req-1',
    user: {
      username: 'carlos_flight',
      display_name: 'Carlos Mendoza',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      bio: 'Coordinador de rampa aeroportuaria en LIM | Apasionado de la aviación comercial.',
      is_verified: true,
    },
    time: 'Hace 2 h',
  },
  {
    id: 'req-2',
    user: {
      username: 'mariana_ops',
      display_name: 'Mariana Silva ✈️',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      bio: 'Control de tráfico aéreo y operaciones logísticas.',
      is_verified: false,
    },
    time: 'Ayer',
  },
];

export const FollowRequestsModal: React.FC<FollowRequestsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [requests, setRequests] = useState<FollowRequest[]>(INITIAL_REQUESTS);

  if (!isOpen) return null;

  const handleAccept = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-lg bg-black sm:border sm:border-[#2f3336] sm:rounded-2xl flex flex-col overflow-hidden text-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-[#71767b] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-xl text-white">Solicitudes de seguimiento</h2>
          </div>
        </div>

        {/* Subheader info */}
        <div className="p-4 bg-[#16181c] border-b border-[#2f3336] flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#1d9bf0] shrink-0" />
          <p className="text-xs text-[#71767b] leading-relaxed">
            Cuando tu cuenta esté configurada como protegida, solo las personas a las que apruebes podrán ver tus publicaciones e interactuar contigo.
          </p>
        </div>

        {/* List of requests */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2f3336] max-h-[60vh]">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <UserCheck className="w-12 h-12 text-[#71767b] mb-3 stroke-1" />
              <p className="font-bold text-lg text-white">No tienes solicitudes pendientes</p>
              <p className="text-xs text-[#71767b] mt-1 max-w-sm">
                Cuando alguien solicite seguirte, aparecerá aquí para que puedas aceptar o rechazar.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-4 hover:bg-white/[0.02] transition-colors flex items-start gap-3"
              >
                <img
                  src={getSafeAvatarUrl(req.user.avatar_url)}
                  alt={req.user.display_name}
                  className="w-10 h-10 rounded-full object-cover border border-[#2f3336] shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 font-bold text-sm text-white">
                    <span className="truncate">{req.user.display_name}</span>
                    {req.user.is_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-[#71767b] truncate">@{req.user.username}</div>
                  <p className="text-xs text-[#e7e9ea] mt-1 line-clamp-2 leading-relaxed">
                    {req.user.bio}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-full transition-transform active:scale-95 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Aceptar</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex items-center gap-1 px-3 py-1 border border-[#2f3336] hover:bg-white/10 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5 text-red-400" />
                      <span>Rechazar</span>
                    </button>
                    <span className="text-[11px] text-[#71767b] ml-auto">{req.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
