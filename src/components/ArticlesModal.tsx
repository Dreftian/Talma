import React, { useState } from 'react';
import {
  X,
  PenLine,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  Heading,
  Quote,
  CheckCircle2,
  Trash2,
  Eye,
  FileText,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';
import { getSafeAvatarUrl } from '../lib/avatar';

interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  cover_url?: string;
  published_at: string;
  read_time: string;
  author: UserProfile;
}

interface ArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onPublishArticle?: (article: { title: string; content: string }) => void;
}

export const ArticlesModal: React.FC<ArticlesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPublishArticle,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'drafts'>('articles');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Editor states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Mock initial articles & drafts
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 'art-1',
      title: 'El futuro de las operaciones aéreas y logística en Talma 2026',
      subtitle: 'Innovación en tiempos de respuesta aeroportuaria y sostenibilidad.',
      content:
        'Las operaciones de rampa y gestión de carga aérea en América Latina están experimentando una revolución tecnológica sin precedentes. A través de la automatización en tiempo real y la optimización de procesos logísticos, logramos reducir los tiempos en pista a mínimos históricos.',
      cover_url:
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      published_at: 'Hace 3 días',
      read_time: '4 min de lectura',
      author: currentUser,
    },
  ]);

  const [drafts, setDrafts] = useState<
    Array<{ id: string; title: string; content: string; updated_at: string }>
  >([
    {
      id: 'draft-1',
      title: 'Guía de procedimientos de seguridad en rampa',
      content: 'Borrador inicial con los lineamientos clave para la temporada alta...',
      updated_at: 'Guardado hoy a las 14:20',
    },
  ]);

  if (!isOpen) return null;

  const handlePublish = () => {
    if (!title.trim()) {
      alert('Por favor introduce un título para tu artículo.');
      return;
    }

    const newArticle: Article = {
      id: 'art-' + Date.now(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      content: content.trim(),
      cover_url: coverUrl.trim() || undefined,
      published_at: 'Hace un momento',
      read_time: `${Math.max(1, Math.ceil(content.split(' ').length / 150))} min de lectura`,
      author: currentUser,
    };

    setArticles([newArticle, ...articles]);
    if (onPublishArticle) {
      onPublishArticle({ title: newArticle.title, content: newArticle.content });
    }

    // Reset and exit editor
    setTitle('');
    setSubtitle('');
    setContent('');
    setCoverUrl('');
    setIsEditorOpen(false);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}${prefix}Texto${suffix}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Container - Full screen on mobile, elegant dialog on desktop */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-2xl bg-black sm:border sm:border-[#2f3336] sm:rounded-2xl flex flex-col overflow-hidden text-white shadow-2xl">
        {/* If in Editor Mode */}
        {isEditorOpen ? (
          <div className="flex flex-col h-full">
            {/* Editor Header */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-[#71767b] hover:text-white transition-colors cursor-pointer"
                  title="Volver"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="font-bold text-base text-white">Nuevo Artículo</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-[#71767b]">
                  {isSavingDraft ? 'Guardando...' : 'Borrador guardado'}
                </span>
                <button
                  onClick={handlePublish}
                  disabled={!title.trim()}
                  className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-full text-sm transition-colors cursor-pointer"
                >
                  Publicar
                </button>
              </div>
            </div>

            {/* Editor Formatting Bar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-[#2f3336] bg-[#0b0e14] overflow-x-auto text-[#71767b]">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                title="Negrita"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                title="Cursiva"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ')}
                className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                title="Encabezado"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n- ')}
                className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                title="Lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n> ')}
                className="p-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                title="Cita"
              >
                <Quote className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-[#2f3336] mx-1" />
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Introduce la URL de una imagen de portada:');
                  if (url) setCoverUrl(url);
                }}
                className="flex items-center gap-1.5 text-xs text-[#1d9bf0] hover:underline px-2 py-1"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{coverUrl ? 'Cambiar portada' : 'Agregar portada'}</span>
              </button>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
              {coverUrl && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#2f3336] group">
                  <img src={coverUrl} alt="Portada" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCoverUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}

              <input
                type="text"
                placeholder="Título del artículo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl sm:text-3xl font-extrabold bg-transparent text-white placeholder-[#71767b] focus:outline-hidden"
              />

              <input
                type="text"
                placeholder="Añadir subtítulo o breve resumen..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full text-base sm:text-lg text-[#71767b] bg-transparent placeholder-[#71767b]/70 focus:outline-hidden border-b border-[#2f3336]/40 pb-2"
              />

              <textarea
                placeholder="Comienza a redactar tu artículo aquí. Comparte análisis detallados, novedades o conocimientos con la comunidad..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-1 min-h-[300px] text-[15px] sm:text-base leading-relaxed bg-transparent text-white placeholder-[#71767b] resize-none focus:outline-hidden"
              />
            </div>
          </div>
        ) : (
          /* Main Articles Screen (Exact match with reference 13.jpeg) */
          <div className="flex flex-col h-full">
            {/* Top Header */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-[#71767b] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="font-bold text-xl text-white">Artículos</h2>
              </div>

              {/* Action button "Escribir" matching 13.jpeg */}
              <button
                onClick={() => setIsEditorOpen(true)}
                className="flex items-center gap-2 bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:bg-white/90 transition-transform active:scale-95 cursor-pointer"
              >
                <PenLine className="w-4 h-4" />
                <span>Escribir</span>
              </button>
            </div>

            {/* Banner announcement (matches 13.jpeg) */}
            <div className="p-4 bg-[#16181c] border-b border-[#2f3336] flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-[#1d9bf0]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Escribe un artículo</h3>
                <p className="text-xs text-[#71767b] mt-0.5 leading-relaxed">
                  Crea publicaciones extensas con opciones de formato complejas como negrita, cursiva, viñetas y más. Tus borradores se guardan automáticamente.
                </p>
              </div>
            </div>

            {/* Tabs: Artículos / Borradores (matches 13.jpeg) */}
            <div className="flex border-b border-[#2f3336]">
              <button
                onClick={() => setActiveTab('articles')}
                className={`flex-1 py-3 text-center text-sm font-bold relative transition-colors cursor-pointer ${
                  activeTab === 'articles' ? 'text-white' : 'text-[#71767b] hover:text-white'
                }`}
              >
                Artículos ({articles.length})
                {activeTab === 'articles' && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`flex-1 py-3 text-center text-sm font-bold relative transition-colors cursor-pointer ${
                  activeTab === 'drafts' ? 'text-white' : 'text-[#71767b] hover:text-white'
                }`}
              >
                Borradores ({drafts.length})
                {activeTab === 'drafts' && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full" />
                )}
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#2f3336]">
              {activeTab === 'articles' ? (
                articles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <FileText className="w-12 h-12 text-[#71767b] mb-3 stroke-1" />
                    <p className="font-bold text-lg text-white">No has publicado ningún artículo</p>
                    <p className="text-xs text-[#71767b] mt-1 max-w-sm">
                      Tus artículos aparecerán aquí cuando los publiques para que toda la red pueda leerlos.
                    </p>
                    <button
                      onClick={() => setIsEditorOpen(true)}
                      className="mt-4 bg-[#1d9bf0] text-white font-bold px-4 py-2 rounded-full text-sm hover:bg-[#1a8cd8] transition-colors"
                    >
                      Escribir mi primer artículo
                    </button>
                  </div>
                ) : (
                  articles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col gap-2"
                    >
                      {art.cover_url && (
                        <div className="w-full h-36 rounded-xl overflow-hidden border border-[#2f3336]">
                          <img
                            src={art.cover_url}
                            alt={art.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <img
                          src={getSafeAvatarUrl(art.author.avatar_url)}
                          alt={art.author.display_name}
                          className="w-5 h-5 rounded-full object-cover border border-[#2f3336]"
                        />
                        <span className="text-xs text-[#71767b]">{art.author.display_name}</span>
                        <span className="text-xs text-[#71767b]">· {art.published_at}</span>
                        <span className="text-xs text-[#1d9bf0] ml-auto">{art.read_time}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-white hover:text-[#1d9bf0] transition-colors cursor-pointer">
                        {art.title}
                      </h4>
                      {art.subtitle && (
                        <p className="text-xs text-[#71767b] line-clamp-2 leading-relaxed">
                          {art.subtitle}
                        </p>
                      )}
                    </div>
                  ))
                )
              ) : drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <FileText className="w-12 h-12 text-[#71767b] mb-3 stroke-1" />
                  <p className="font-bold text-lg text-white">No tienes borradores guardados</p>
                  <p className="text-xs text-[#71767b] mt-1 max-w-sm">
                    Cuando empieces a escribir un artículo, tus cambios se guardarán automáticamente aquí.
                  </p>
                </div>
              ) : (
                drafts.map((dr) => (
                  <div
                    key={dr.id}
                    className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                  >
                    <div className="flex-1 pr-4">
                      <h4 className="font-bold text-[15px] text-white">{dr.title}</h4>
                      <p className="text-xs text-[#71767b] line-clamp-1 mt-0.5">{dr.content}</p>
                      <span className="text-[11px] text-[#71767b] mt-1 block">
                        {dr.updated_at}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setTitle(dr.title);
                        setContent(dr.content);
                        setIsEditorOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
