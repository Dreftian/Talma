import React, { useState } from 'react';
import { Search, Flame, TrendingUp, Sparkles, MoreHorizontal, Settings } from 'lucide-react';
import { TrendItem } from '../types';

interface ExploreViewProps {
  onSearch: (q: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'for_you' | 'trending' | 'news' | 'sports' | 'entertainment'>('for_you');

  const featured = {
    tag: 'Talma · Tecnología',
    title: 'La nueva experiencia social en tiempo real diseñada para creadores',
    posts: '124.5 mil publicaciones',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  };

  const trends: TrendItem[] = [
    { category: 'Tendencia en Perú · Tecnología', topic: '#TalmaSocial', posts_count: '24.8 mil publicaciones' },
    { category: 'Tendencia global', topic: 'Inteligencia Artificial', posts_count: '152 mil publicaciones' },
    { category: 'Innovación · En vivo', topic: '#Extalmita', posts_count: '42.1 mil publicaciones' },
    { category: 'Deportes · Fútbol', topic: 'Champions League', posts_count: '98.4 mil publicaciones' },
    { category: 'Música · Tendencia', topic: 'Bad Bunny', posts_count: '64.1 mil publicaciones' },
    { category: 'Finanzas & Mercados', topic: 'Bitcoin & Cripto', posts_count: '31.9 mil publicaciones' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Search Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 p-3 border-b border-[#2f3336] flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#202327] border border-transparent focus-within:border-[#1d9bf0] transition-colors">
          <Search className="w-5 h-5 text-[#71767b]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
            placeholder="Buscar"
            className="bg-transparent text-sm text-[#e7e9ea] outline-none w-full"
          />
        </div>
        <button className="p-2 text-[#71767b] hover:text-white hover:bg-[#181818] rounded-full transition-colors cursor-pointer">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2f3336] overflow-x-auto no-scrollbar">
        {[
          { id: 'for_you', label: 'Para ti' },
          { id: 'trending', label: 'Tendencias' },
          { id: 'news', label: 'Noticias' },
          { id: 'sports', label: 'Deportes' },
          { id: 'entertainment', label: 'Entretenimiento' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 min-w-[90px] py-3.5 text-center relative hover:bg-[#181818] transition-colors cursor-pointer"
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
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-12 bg-[#1d9bf0] rounded-full" />
            )}
          </button>
        ))}
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
          <span className="text-xs font-bold text-[#1d9bf0]">{featured.tag}</span>
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
              className="text-[#71767b] hover:text-[#1d9bf0] p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
