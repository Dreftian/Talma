import React, { useState, useEffect } from 'react';
import { Search, X, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { UserProfile, TrendItem } from '../types';
import { fetchRecommendations, toggleFollow } from '../lib/api';

interface RightSidebarProps {
  currentUserId: string;
  onSelectProfile: (username: string) => void;
  onSearch: (query: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentUserId,
  onSelectProfile,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recommendations, setRecommendations] = useState<UserProfile[]>([]);
  const [followingMap, setFollowingMap] = useState<{ [id: string]: boolean }>({});

  const trends: TrendItem[] = [
    { category: 'Tendencia en Perú · Tecnología', topic: '#TalmaSocial', posts_count: '24.8 mil posts' },
    { category: 'Desarrollo · En vivo', topic: '#SupabaseStorage', posts_count: '18.2 mil posts' },
    { category: 'Tendencia global', topic: 'Inteligencia Artificial', posts_count: '152 mil posts' },
    { category: 'Deportes · Fútbol', topic: 'Champions League', posts_count: '98.4 mil posts' },
    { category: 'Música · Tendencia', topic: 'Bad Bunny', posts_count: '64.1 mil posts' },
  ];

  useEffect(() => {
    fetchRecommendations(currentUserId)
      .then((users) => setRecommendations(users))
      .catch(() => {});
  }, [currentUserId]);

  const handleFollow = async (userId: string) => {
    try {
      const res = await toggleFollow(currentUserId, userId);
      setFollowingMap((prev) => ({ ...prev, [userId]: res.following }));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[350px] xl:w-[390px] px-4 py-3 select-none h-screen sticky top-0 overflow-y-auto shrink-0 border-l border-[#2f3336]">
      {/* Sticky Search bar */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-20 pb-1">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-200 ${
              isFocused
                ? 'bg-black border-[#22c55e] ring-1 ring-[#22c55e]'
                : 'bg-[#202327] border-transparent'
            }`}
          >
            <Search
              className={`w-5 h-5 shrink-0 ${
                isFocused ? 'text-[#22c55e]' : 'text-[#71767b]'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Buscar en Talma"
              className="bg-transparent text-[15px] text-[#e7e9ea] placeholder-[#71767b] outline-none w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="bg-[#22c55e] text-black rounded-full p-0.5 hover:bg-[#16a34a] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Premium Subscription Card */}
      <div className="bg-[#16181c] rounded-2xl p-4 border border-[#2f3336]/60 flex flex-col gap-2.5">
        <h2 className="font-extrabold text-xl text-[#e7e9ea] leading-snug">
          Suscríbete a Talma Premium
        </h2>
        <p className="text-sm text-[#71767b] leading-relaxed">
          Sube videos en alta definición a Supabase Storage, obtén la marca de verificación y disfruta de una experiencia sin límites.
        </p>
        <div>
          <button className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold px-5 py-2 rounded-full text-sm transition-all duration-200 active:scale-95 shadow-sm">
            Suscribirse
          </button>
        </div>
      </div>

      {/* Trending Topics (Qué está pasando) */}
      <div className="bg-[#16181c] rounded-2xl border border-[#2f3336]/60 overflow-hidden">
        <h2 className="font-extrabold text-xl text-[#e7e9ea] px-4 pt-3 pb-2">
          Qué está pasando
        </h2>
        <div className="flex flex-col">
          {trends.map((trend, i) => (
            <div
              key={i}
              onClick={() => onSearch(trend.topic)}
              className="px-4 py-3 hover:bg-[#1d1f23] cursor-pointer transition-colors flex items-start justify-between group"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-[#71767b]">{trend.category}</span>
                <span className="font-bold text-[15px] text-[#e7e9ea] group-hover:text-white">
                  {trend.topic}
                </span>
                <span className="text-[12px] text-[#71767b]">{trend.posts_count}</span>
              </div>
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-[#71767b] hover:text-[#22c55e] p-1.5 rounded-full hover:bg-[#22c55e]/10 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="px-4 py-3.5 hover:bg-[#1d1f23] cursor-pointer transition-colors border-t border-[#2f3336]/40">
          <span className="text-[14px] text-[#22c55e] font-medium hover:underline">
            Mostrar más
          </span>
        </div>
      </div>

      {/* Who to follow (A quién seguir) */}
      <div className="bg-[#16181c] rounded-2xl border border-[#2f3336]/60 overflow-hidden">
        <h2 className="font-extrabold text-xl text-[#e7e9ea] px-4 pt-3 pb-2">
          A quién seguir
        </h2>
        <div className="flex flex-col">
          {recommendations.map((user) => {
            const isFollowing = followingMap[user.id] ?? false;
            return (
              <div
                key={user.id}
                onClick={() => onSelectProfile(user.username)}
                className="px-4 py-3 hover:bg-[#1d1f23] cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.display_name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#2f3336]"
                  />
                  <div className="flex flex-col leading-tight overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[15px] text-white truncate hover:underline">
                        {user.display_name}
                      </span>
                      {user.is_verified && (
                        <CheckCircle2 className="w-4 h-4 text-[#22c55e] fill-[#22c55e] stroke-black shrink-0" />
                      )}
                    </div>
                    <span className="text-sm text-[#71767b] truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(user.id);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 shrink-0 ${
                    isFollowing
                      ? 'border border-[#71767b] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
                      : 'bg-white text-black hover:bg-white/90 active:scale-95'
                  }`}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3.5 hover:bg-[#1d1f23] cursor-pointer transition-colors border-t border-[#2f3336]/40">
          <span className="text-[14px] text-[#22c55e] font-medium hover:underline">
            Mostrar más
          </span>
        </div>
      </div>

      {/* Footer legal links */}
      <footer className="px-4 py-2 text-[13px] text-[#71767b] leading-normal flex flex-wrap gap-x-2 gap-y-1">
        <a href="#" className="hover:underline">Condiciones de Servicio</a>
        <a href="#" className="hover:underline">Privacidad</a>
        <a href="#" className="hover:underline">Cookies</a>
        <a href="#" className="hover:underline">Accesibilidad</a>
        <a href="#" className="hover:underline">Información de anuncios</a>
        <span>© 2026 Talma, Inc. con Supabase</span>
      </footer>
    </aside>
  );
};
