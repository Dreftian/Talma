import React, { useState } from 'react';
import {
  X,
  Users,
  Search,
  Plus,
  Check,
  Sparkles,
  Plane,
  Code,
  Shield,
  Compass,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { UserProfile } from '../types';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  members_count: number;
  banner_url: string;
  is_member: boolean;
}

interface CommunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    name: 'Aeronáutica & Aviación Comercial',
    description: 'Comunidad para pilotos, personal de cabina y apasionados del mundo aeronáutico global.',
    category: 'Aviación',
    members_count: 1420,
    banner_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    is_member: true,
  },
  {
    id: 'comm-2',
    name: 'Talma Operaciones & Rampa 🛫',
    description: 'Espacio de coordinación, mejores prácticas y seguridad operativa en pista aeroportuaria.',
    category: 'Operaciones',
    members_count: 890,
    banner_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
    is_member: false,
  },
  {
    id: 'comm-3',
    name: 'Tech, Cloud & Desarrolladores',
    description: 'Ingeniería de software, arquitecturas en la nube, APIs y automatización en tiempo real.',
    category: 'Tecnología',
    members_count: 654,
    banner_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    is_member: false,
  },
  {
    id: 'comm-4',
    name: 'Logística de Carga & Aduanas',
    description: 'Trazabilidad de carga aérea, refrigerados, mercancías peligrosas y comercio exterior.',
    category: 'Logística',
    members_count: 420,
    banner_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    is_member: false,
  },
];

const WELCOME_STORAGE_KEY = 'talma_communities_welcome_seen';

/* Filas de la pantalla de bienvenida (ref "WhatsApp Image 2026-10-18 at 5.58.26 21312PM.jpeg") */
const WELCOME_ROWS = [
  {
    icon: Sparkles,
    title: 'Conoce a otras personas con tus mismos intereses',
    description: 'Únete a Comunidades para conectarte con personas que comparten tus intereses.',
  },
  {
    icon: Users,
    title: 'Postea directamente en una Comunidad',
    description: 'Tus posts se comparten con los miembros de la Comunidad y con tus seguidores.',
  },
  {
    icon: Heart,
    title: 'Obtén respaldo cuando lo necesites',
    description: 'Los admins y los moderadores ayudan a mantener las Comunidades seguras y las conversaciones en regla.',
  },
];

export const CommunitiesModal: React.FC<CommunitiesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'my_communities'>('discover');
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');

  /* Pantalla de bienvenida (ref "WhatsApp Image 2026-10-18 at 5.58.26 21312PM.jpeg"):
     se muestra la primera vez (persistido en localStorage) y puede reabrirse desde el header. */
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      return localStorage.getItem(WELCOME_STORAGE_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const dismissWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem(WELCOME_STORAGE_KEY, '1');
    } catch {
      /* localStorage no disponible: la bienvenida simplemente reaparecerá */
    }
  };

  if (!isOpen) return null;

  const toggleMembership = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextMember = !c.is_member;
          return {
            ...c,
            is_member: nextMember,
            members_count: nextMember ? c.members_count + 1 : c.members_count - 1,
          };
        }
        return c;
      })
    );
  };

  const handleCreateCommunity = () => {
    if (!newCommName.trim()) return;
    const created: Community = {
      id: 'comm-' + Date.now(),
      name: newCommName.trim(),
      description: newCommDesc.trim() || 'Comunidad creada por @' + currentUser.username,
      category: 'General',
      members_count: 1,
      banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      is_member: true,
    };
    setCommunities([created, ...communities]);
    setNewCommName('');
    setNewCommDesc('');
    setShowCreate(false);
    setActiveTab('my_communities');
  };

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'my_communities') {
      return matchesSearch && c.is_member;
    }
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Dialog container */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-2xl bg-black sm:border sm:border-[#2f3336] sm:rounded-2xl flex flex-col overflow-hidden text-white shadow-2xl">
        {/* Header (matches 5.58.26 21312PM.jpeg) */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-[#71767b] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-xl text-white">Comunidades</h2>
          </div>

          <div className="flex items-center gap-1">
            {/* Reabrir la bienvenida (ref 5.58.26 21312PM.jpeg) */}
            <button
              onClick={() => setShowWelcome(true)}
              title="Cómo funcionan las Comunidades"
              aria-label="Cómo funcionan las Comunidades"
              className="p-2 rounded-full hover:bg-white/10 text-[#71767b] hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 bg-white text-black font-bold px-3 py-1.5 rounded-full text-xs hover:bg-white/90 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear</span>
            </button>
          </div>
        </div>

        {/* Pantalla de bienvenida "Te damos la bienvenida a Comunidades"
            (ref "WhatsApp Image 2026-10-18 at 5.58.26 21312PM.jpeg") */}
        {showWelcome && (
          <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/60 animate-fade-in">
            <div className="bg-black border-t border-[#2f3336] sm:border sm:rounded-t-2xl max-h-full overflow-y-auto px-5 pb-[calc(20px_+_env(safe-area-inset-bottom))] pt-2 animate-pop-in">
              {/* Drag handle */}
              <div className="flex justify-center pb-4">
                <div className="w-9 h-1 rounded-full bg-[#536471]" aria-hidden="true" />
              </div>

              <h2 className="text-center font-extrabold text-[28px] leading-[1.15] text-white">
                Te damos la bienvenida a
                <br />
                Comunidades
              </h2>
              <p className="mt-3 text-center text-[15px] text-[#71767b] leading-relaxed">
                Las Comunidades son grupos de conversación moderados, donde las personas en Talma
                pueden conectarse y compartir.
              </p>

              <div className="mt-6 flex flex-col gap-5">
                {WELCOME_ROWS.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center text-white">
                      <Icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[15px] text-white leading-snug">{title}</h3>
                      <p className="mt-1 text-[14px] text-[#71767b] leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={dismissWelcome}
                className="mt-8 mb-1 w-full py-3.5 rounded-full bg-white text-black font-bold text-[15px] hover:bg-white/90 active:scale-[0.99] transition-all cursor-pointer"
              >
                Consultar
              </button>
            </div>
          </div>
        )}

        {/* Creation Form popup */}
        {showCreate && (
          <div className="p-4 bg-[#16181c] border-b border-[#2f3336] flex flex-col gap-3 animate-fade-in">
            <span className="font-bold text-sm text-white">Crear nueva comunidad</span>
            <input
              type="text"
              placeholder="Nombre de la comunidad"
              value={newCommName}
              onChange={(e) => setNewCommName(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-xl text-sm text-white focus:outline-hidden focus:border-[#1d9bf0]"
            />
            <textarea
              placeholder="Descripción breve..."
              value={newCommDesc}
              onChange={(e) => setNewCommDesc(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-xl text-sm text-white focus:outline-hidden focus:border-[#1d9bf0] resize-none h-18"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 text-xs text-[#71767b] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCommunity}
                disabled={!newCommName.trim()}
                className="px-4 py-1.5 bg-[#1d9bf0] text-white text-xs font-bold rounded-full disabled:opacity-50"
              >
                Crear comunidad
              </button>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="p-3 border-b border-[#2f3336]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#16181c] rounded-full border border-transparent focus-within:border-[#1d9bf0] focus-within:bg-black transition-colors">
            <Search className="w-4 h-4 text-[#71767b]" />
            <input
              type="text"
              placeholder="Buscar comunidades..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-[#71767b] focus:outline-hidden w-full"
            />
          </div>
        </div>

        {/* Tabs: Descubrir / Mis Comunidades */}
        <div className="flex border-b border-[#2f3336]">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-3 text-center text-sm font-bold relative transition-colors cursor-pointer ${
              activeTab === 'discover' ? 'text-white' : 'text-[#71767b] hover:text-white'
            }`}
          >
            Descubrir
            {activeTab === 'discover' && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('my_communities')}
            className={`flex-1 py-3 text-center text-sm font-bold relative transition-colors cursor-pointer ${
              activeTab === 'my_communities' ? 'text-white' : 'text-[#71767b] hover:text-white'
            }`}
          >
            Mis Comunidades ({communities.filter((c) => c.is_member).length})
            {activeTab === 'my_communities' && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full" />
            )}
          </button>
        </div>

        {/* Community List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2f3336]">
          {filteredCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Users className="w-12 h-12 text-[#71767b] mb-3 stroke-1" />
              <p className="font-bold text-lg text-white">No se encontraron comunidades</p>
              <p className="text-xs text-[#71767b] mt-1 max-w-sm">
                Sé el primero en crear una comunidad para tu equipo o área temática.
              </p>
            </div>
          ) : (
            filteredCommunities.map((comm) => (
              <div
                key={comm.id}
                className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col gap-3"
              >
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-[#2f3336]">
                  <img
                    src={comm.banner_url}
                    alt={comm.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-white">
                    {comm.category}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-[16px] text-white leading-tight">
                      {comm.name}
                    </h3>
                    <span className="text-xs text-[#71767b]">
                      {comm.members_count.toLocaleString()} miembros
                    </span>
                    <p className="text-xs text-[#e7e9ea]/80 mt-1 leading-relaxed">
                      {comm.description}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleMembership(comm.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      comm.is_member
                        ? 'border border-[#2f3336] text-white hover:border-red-500 hover:text-red-500'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {comm.is_member ? 'Unido' : 'Unirse'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
