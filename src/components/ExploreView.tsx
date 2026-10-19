import React, { useState } from 'react';
import { Search, MoreHorizontal, Settings } from 'lucide-react';
import { TrendItem, UserProfile } from '../types';
import { getSafeAvatarUrl } from '../lib/avatar';

interface ExploreViewProps {
  onSearch: (q: string) => void;
  currentUser?: UserProfile | null;
  onOpenDrawer?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onSearch, currentUser, onOpenDrawer }) => {
  const [query, setQuery] = useState('');
  // 1.jpeg: la pestaña "Explorar" es la activa por defecto.
  const [activeTab, setActiveTab] = useState<'explore' | 'trending' | 'news' | 'sports' | 'entertainment'>('explore');

  // Etiqueta superior de cada fila tal como la muestra 1.jpeg: "Tendencia en Perú",
  // "Deportes · Tendencia", "Familia & relaciones · Tendencia"...
  const trends: TrendItem[] = [
    { category: 'Tendencia en Perú', topic: '#TalmaSocial', posts_count: '24.8 mil publicaciones' },
    { category: 'Tecnología · Tendencia', topic: 'Inteligencia Artificial', posts_count: '152 mil publicaciones' },
    { category: 'Innovación · Tendencia', topic: '#Extalmita', posts_count: '42.1 mil publicaciones' },
    { category: 'Deportes · Tendencia', topic: 'Champions League', posts_count: '98.4 mil publicaciones' },
    { category: 'Música · Tendencia', topic: 'Bad Bunny', posts_count: '64.1 mil publicaciones' },
    { category: 'Finanzas & Mercados · Tendencia', topic: 'Bitcoin & Cripto', posts_count: '31.9 mil publicaciones' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Search Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 h-[53px] px-3 flex items-center gap-3">
        {currentUser && (
          <button
            onClick={onOpenDrawer}
            className="sm:hidden shrink-0 rounded-full active:scale-95 transition-transform"
            title="Abrir menú"
          >
            <img
              src={getSafeAvatarUrl(currentUser.avatar_url)}
              alt={currentUser.display_name}
              className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
            />
          </button>
        )}

        <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-full bg-[#202327] border border-transparent focus-within:border-[#1d9bf0] transition-colors">
          <Search className="w-4 h-4 text-[#71767b]" />
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

      {/* Tabs — 1.jpeg: empiezan por "Explorar" (activa) y hacen scroll horizontal sin scrollbar.
          En X la pestaña activa va en blanco bold, sin subrayado azul. */}
      <div className="flex border-b border-[#2f3336] overflow-x-auto no-scrollbar">
        {[
          { id: 'explore', label: 'Explorar' },
          { id: 'trending', label: 'Tendencias' },
          { id: 'news', label: 'Noticias' },
          { id: 'sports', label: 'Deportes' },
          { id: 'entertainment', label: 'Entretenimiento' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="shrink-0 px-4 py-3.5 text-center whitespace-nowrap hover:bg-[#181818] transition-colors cursor-pointer"
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
          </button>
        ))}
      </div>

      {/* Trends List — 1.jpeg: sin banner destacado ni título de sección; las filas van directas
          tras las pestañas. Cada fila: categoría 13px gris, término bold 15px y "⋮" a la derecha. */}
      <div className="flex flex-col">
        {trends.map((t, idx) => (
          <div
            key={idx}
            onClick={() => onSearch(t.topic)}
            className="flex items-start justify-between px-4 py-3 hover:bg-[#080808] cursor-pointer transition-colors border-b border-[#2f3336]"
          >
            <div className="min-w-0">
              <p className="text-[13px] text-[#71767b] leading-4 truncate">{t.category}</p>
              <p className="font-bold text-[15px] text-white leading-5 mt-0.5 truncate">{t.topic}</p>
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              title="Más opciones"
              className="shrink-0 -mr-1.5 text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
