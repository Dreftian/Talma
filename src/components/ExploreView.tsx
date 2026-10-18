import React, { useState } from 'react';
import { Search, Flame, TrendingUp, Sparkles, MoreHorizontal } from 'lucide-react';
import { TrendItem } from '../types';

interface ExploreViewProps {
  onSearch: (q: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const featured = {
    tag: 'Talma · Tecnología',
    title: 'Nueva red social descentralizada conectada con Supabase Storage',
    posts: '124.5 mil posts',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  };

  const trends: TrendItem[] = [
    { category: 'Tendencia en Perú · Tecnología', topic: '#TalmaSocial', posts_count: '24.8 mil posts' },
    { category: 'Desarrollo · En vivo', topic: '#SupabaseStorage', posts_count: '18.2 mil posts' },
    { category: 'Tendencia global', topic: 'Inteligencia Artificial', posts_count: '152 mil posts' },
    { category: 'Deportes · Fútbol', topic: 'Champions League', posts_count: '98.4 mil posts' },
    { category: 'Música · Tendencia', topic: 'Bad Bunny', posts_count: '64.1 mil posts' },
    { category: 'Finanzas', topic: 'Bitcoin & Cripto', posts_count: '31.9 mil posts' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Search Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 p-3 border-b border-[#2f3336]">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#202327] border border-transparent focus-within:border-[#22c55e]">
          <Search className="w-5 h-5 text-[#71767b]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
            placeholder="Buscar en Explorar"
            className="bg-transparent text-sm text-[#e7e9ea] outline-none w-full"
          />
        </div>
      </div>

      {/* Featured banner */}
      <div
        onClick={() => onSearch(featured.title)}
        className="relative h-64 w-full overflow-hidden cursor-pointer group"
      >
        <img
          src={featured.image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
          <span className="text-xs font-bold text-[#22c55e]">{featured.tag}</span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1 leading-tight">
            {featured.title}
          </h2>
          <span className="text-xs text-[#71767b] mt-1">{featured.posts}</span>
        </div>
      </div>

      {/* Trends List */}
      <div className="flex flex-col p-2">
        <h3 className="px-4 py-3 font-extrabold text-xl text-white">Tendencias para ti</h3>
        {trends.map((t, idx) => (
          <div
            key={idx}
            onClick={() => onSearch(t.topic)}
            className="flex items-start justify-between px-4 py-3 hover:bg-[#080808] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-xs text-[#71767b]">{t.category}</span>
              <p className="font-bold text-[15px] text-white mt-0.5">{t.topic}</p>
              <span className="text-xs text-[#71767b]">{t.posts_count}</span>
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              className="text-[#71767b] hover:text-[#22c55e] p-1.5"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
