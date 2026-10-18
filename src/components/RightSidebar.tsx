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
    { category: 'Deportes · Tendencia', topic: 'Vini', posts_count: '142 mil posts' },
    { category: 'Deportes · Tendencia', topic: 'Valera', posts_count: '38.4 mil posts' },
    { category: 'Deportes · Tendencia', topic: 'Tebas', posts_count: '21.7 mil posts' },
    { category: 'Tendencia en Perú', topic: '#YoSoy', posts_count: '64.9 mil posts' },
    { category: 'Tendencia en Perú · Tecnología', topic: '#Talma', posts_count: '25.3 mil posts' },
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
    <aside className="hidden lg:flex flex-col gap-4 w-[350px] xl:w-[350px] px-4 py-3 select-none h-screen sticky top-0 overflow-y-auto shrink-0 border-l border-[#2f3336]">
      {/* Sticky Search bar */}
      <div className="sticky top-0 bg-black z-20 pb-1">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-200 ${
              isFocused
                ? 'bg-black border-[#1d9bf0] ring-1 ring-[#1d9bf0]'
                : 'bg-[#202327] border-transparent'
            }`}
          >
            <Search
              className={`w-5 h-5 shrink-0 ${
                isFocused ? 'text-[#1d9bf0]' : 'text-[#71767b]'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Buscar"
              className="bg-transparent text-[15px] text-[#e7e9ea] placeholder-[#71767b] outline-none w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="bg-[#1d9bf0] text-white rounded-full p-0.5 hover:bg-[#1a8cd8] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Trending Topics (Qué está pasando) - Exact X desktop style */}
      <div className="bg-black rounded-2xl border border-[#2f3336] overflow-hidden">
        <h2 className="font-extrabold text-[20px] text-[#e7e9ea] px-4 pt-3 pb-2">
          Qué está pasando
        </h2>
        <div className="flex flex-col">
          {trends.map((trend, i) => (
            <div
              key={i}
              onClick={() => onSearch(trend.topic)}
              className="px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors flex items-start justify-between group"
            >
              <div className="flex flex-col">
                <span className="text-[13px] text-[#71767b] leading-4">{trend.category}</span>
                <span className="font-bold text-[15px] text-[#e7e9ea] leading-5 pt-0.5 group-hover:underline">
                  {trend.topic}
                </span>
                {trend.posts_count && (
                  <span className="text-[13px] text-[#71767b] leading-4 pt-0.5">
                    {trend.posts_count}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 p-1.5 -mr-1 -mt-1 rounded-full transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div
          onClick={() => onSearch('tendencias')}
          className="px-4 py-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors"
        >
          <span className="text-[15px] text-[#1d9bf0] hover:underline font-normal block">
            Mostrar más
          </span>
        </div>
      </div>

      {/* Who to follow (A quién seguir) */}
      {recommendations.length > 0 && (
        <div className="bg-black rounded-2xl border border-[#2f3336] overflow-hidden">
          <h2 className="font-extrabold text-[20px] text-[#e7e9ea] px-4 pt-3 pb-2">
            A quién seguir
          </h2>
          <div className="flex flex-col">
            {recommendations.map((user) => {
              const isFollowing = followingMap[user.id] ?? false;
              return (
                <div
                  key={user.id}
                  onClick={() => onSelectProfile(user.username)}
                  className="px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors flex items-center justify-between"
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
                          <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                        )}
                      </div>
                      <span className="text-[13px] text-[#71767b] truncate">
                        @{user.username}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(user.id);
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                      isFollowing
                        ? 'border border-[#536471] text-white hover:border-[#f4212e] hover:text-[#f4212e] hover:bg-[#f4212e]/10'
                        : 'bg-white text-black hover:bg-[#d7dbdc]'
                    }`}
                  >
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </button>
                </div>
              );
            })}
          </div>
          <div
            onClick={() => onSearch('usuarios')}
            className="px-4 py-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors"
          >
            <span className="text-[15px] text-[#1d9bf0] hover:underline font-normal block">
              Mostrar más
            </span>
          </div>
        </div>
      )}

      {/* Footer copyright and links */}
      <footer className="text-[13px] text-[#71767b] leading-4 px-4 py-3 flex flex-wrap gap-x-3 gap-y-1 select-none">
        <a href="#" className="hover:underline">Condiciones de Servicio</a>
        <a href="#" className="hover:underline">Política de Privacidad</a>
        <a href="#" className="hover:underline">Política de cookies</a>
        <a href="#" className="hover:underline">Accesibilidad</a>
        <a href="#" className="hover:underline">Información de anuncios</a>
        <span>© 2026 Talma Corp.</span>
      </footer>
    </aside>
  );
};
