import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Repeat2,
  Bookmark,
  Share,
  MessageSquare,
  BarChart2,
  MoreHorizontal,
  Trash2,
  EyeOff,
  Link as LinkIcon,
  Image as ImageIcon,
  Film,
  Maximize2,
  X,
  Camera,
  Mic,
  ListOrdered,
  MapPin,
  Flag,
  Loader2,
} from 'lucide-react';
import { Post, UserProfile } from '../types';
import { formatFullDate, formatNumber, formatRelativeTime } from '../lib/utils';
import {
  fetchPostById,
  toggleLike,
  toggleRepost,
  toggleBookmark,
  votePoll,
  toggleFollow,
  createPost,
} from '../lib/api';
import { MediaPreview } from './MediaPreview';
import { PollView } from './PollView';
import { getSafeAvatarUrl } from '../lib/avatar';

const MAX_REPLY_CHARS = 280;
const RING_CIRCUMFERENCE = 2 * Math.PI * 9;

const ComposerIconButton: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors cursor-pointer shrink-0"
  >
    {children}
  </button>
);

interface TweetDetailModalProps {
  postId: string;
  currentUser: UserProfile;
  onBack: () => void;
  onSelectProfile: (username: string) => void;
  onDelete?: (postId: string) => void;
  onHide?: (postId: string) => void;
}

export const TweetDetailModal: React.FC<TweetDetailModalProps> = ({
  postId,
  currentUser,
  onBack,
  onSelectProfile,
  onDelete,
  onHide,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isReposted, setIsReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  // Pantalla dedicada de respuesta (ref "WhatsApp Ima222334ge 2026-10-18 at 5.58.29 PM.jpeg")
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await fetchPostById(postId, currentUser.id);
      setPost(data);
      setIsLiked(data.is_liked ?? false);
      setLikesCount(data.likes_count);
      setIsReposted(data.is_reposted ?? false);
      setRepostsCount(data.reposts_count);
      setIsBookmarked(data.is_bookmarked ?? false);
      setIsFollowing(data.author?.is_following ?? false);
    } catch (err) {
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  const handleToggleFollow = async () => {
    if (!post || post.is_anonymous) return;
    try {
      const res = await toggleFollow(post.author.id, currentUser.id);
      setIsFollowing(res.following);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await toggleLike(post.id, currentUser.id);
      setIsLiked(res.liked);
      setLikesCount(res.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepost = async () => {
    if (!post) return;
    try {
      const res = await toggleRepost(post.id, currentUser.id);
      setIsReposted(res.reposted);
      setRepostsCount(res.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!post) return;
    try {
      const res = await toggleBookmark(post.id, currentUser.id);
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (optionId: number) => {
    if (!post) return;
    try {
      const updated = await votePoll(post.id, optionId, currentUser.id);
      setPost({ ...post, poll: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const openReplyMode = () => {
    setReplyError(null);
    setReplyMode(true);
  };

  const closeReplyMode = () => {
    setReplyMode(false);
    setReplyError(null);
  };

  const handleSubmitReply = async () => {
    if (!post || !replyText.trim() || isSubmittingReply) return;
    try {
      setIsSubmittingReply(true);
      setReplyError(null);
      await createPost({
        user_id: currentUser.id,
        content: replyText.trim(),
        reply_to_id: post.id,
      });
      setReplyText('');
      setReplyMode(false);
      await loadPost();
    } catch (err: any) {
      setReplyError(err?.message || 'Error al publicar tu respuesta');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (loading || !post) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="relative sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-[#181818] transition-colors cursor-pointer" title="Volver">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 font-extrabold text-[20px] text-white">Post</span>
          <span className="p-2 -mr-2 w-9" aria-hidden="true" />
        </div>
        <div className="p-8 text-center text-[#71767b]">Cargando post...</div>
      </div>
    );
  }

  const replies = (post as any).replies || [];
  const replyHandles = post.is_anonymous
    ? ['anonimo']
    : [post.author.username, ...(post.reply_to_user ? [post.reply_to_user.replace(/^@/, '')] : [])];
  const replyCharsLeft = MAX_REPLY_CHARS - replyText.length;
  const replyProgress = Math.min(replyText.length / MAX_REPLY_CHARS, 1);
  const canReply = replyText.trim().length > 0 && !isSubmittingReply;

  /* Pantalla dedicada de respuesta (ref "WhatsApp Ima222334ge 2026-10-18 at 5.58.29 PM.jpeg") */
  if (replyMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col text-white animate-fade-in">
        {/* Header: ✕ a la izquierda + píldora azul "Responder" deshabilitada hasta que haya texto */}
        <div className="shrink-0 flex items-center justify-between px-4 h-[53px] border-b border-[#2f3336] bg-black/80 backdrop-blur-md">
          <button
            onClick={closeReplyMode}
            className="p-2 -ml-2 rounded-full hover:bg-[#181818] transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleSubmitReply}
            disabled={!canReply}
            className={`px-5 py-1.5 rounded-full font-bold text-[15px] transition-all flex items-center gap-1.5 ${
              canReply
                ? 'bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white active:scale-95 cursor-pointer'
                : 'bg-[#1d9bf0]/40 text-white/60 cursor-not-allowed'
            }`}
          >
            {isSubmittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Responder</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-3">
          {/* Post original resumido con línea conectora */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              {post.is_anonymous ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1c1f23] to-[#0d0f12] border border-[#2f3336] flex items-center justify-center text-lg select-none">
                  🎭
                </div>
              ) : (
                <img
                  src={getSafeAvatarUrl(post.author.avatar_url)}
                  alt={post.author.display_name}
                  className="w-10 h-10 rounded-full object-cover border border-[#2f3336]"
                />
              )}
              <div className="w-[2px] flex-1 min-h-[16px] mt-2 rounded-full bg-[#2f3336]" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0 pb-3">
              <div className="flex items-center gap-1.5 flex-wrap text-[15px] leading-tight">
                <span className="font-bold text-[#e7e9ea]">
                  {post.is_anonymous ? post.anonymous_name || 'Anónimo' : post.author.display_name}
                </span>
                {!post.is_anonymous && post.author.is_verified && (
                  <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                )}
                <span className="text-[#71767b]">@{post.is_anonymous ? 'anonimo' : post.author.username}</span>
                <span className="text-[#71767b]">·</span>
                <span className="text-[#71767b]">{formatRelativeTime(post.created_at)}</span>
              </div>
              {post.content && (
                <p className="mt-1 text-[15px] text-[#e7e9ea] leading-normal whitespace-pre-line break-words">
                  {post.content}
                </p>
              )}
            </div>
          </div>

          {/* Composer de respuesta: avatar 40px + "Publicar tu respuesta" */}
          <div className="flex gap-3">
            <img
              src={getSafeAvatarUrl(currentUser.avatar_url)}
              alt={currentUser.display_name}
              className="w-10 h-10 rounded-full object-cover border border-[#2f3336] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] leading-snug text-[#71767b]">
                Respondiendo a <span className="text-[#1d9bf0]">@{replyHandles[0]}</span>
                {replyHandles.length > 1 && (
                  <>
                    {' '}y a <span className="text-[#1d9bf0]">@{replyHandles[1]}</span>
                  </>
                )}
              </div>
              <textarea
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Publicar tu respuesta"
                rows={4}
                maxLength={MAX_REPLY_CHARS}
                className="mt-2 w-full bg-transparent text-[#e7e9ea] text-[19px] placeholder-[#71767b] outline-none resize-none leading-relaxed"
              />
              {replyError && <div className="mt-1 text-sm text-red-400">{replyError}</div>}
            </div>
          </div>
        </div>

        {/* Barra inferior: 7 iconos de composición + círculo de progreso */}
        <div className="shrink-0 border-t border-[#2f3336] px-2 py-2 flex items-center justify-between bg-black">
          <div className="flex items-center overflow-x-auto">
            <ComposerIconButton label="Añadir imagen">
              <ImageIcon className="w-5 h-5" />
            </ComposerIconButton>
            <ComposerIconButton label="Cámara">
              <Camera className="w-5 h-5" />
            </ComposerIconButton>
            <ComposerIconButton label="Nota de voz">
              <Mic className="w-5 h-5" />
            </ComposerIconButton>
            <ComposerIconButton label="Añadir GIF">
              <span className="text-[11px] font-black border border-current rounded px-1 py-0.5 leading-none">GIF</span>
            </ComposerIconButton>
            <ComposerIconButton label="Encuesta o lista">
              <ListOrdered className="w-5 h-5" />
            </ComposerIconButton>
            <ComposerIconButton label="Ubicación">
              <MapPin className="w-5 h-5" />
            </ComposerIconButton>
            <ComposerIconButton label="Marcar">
              <Flag className="w-5 h-5" />
            </ComposerIconButton>
          </div>

          <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
            <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="#2f3336" strokeWidth="2" />
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke={replyCharsLeft <= 20 ? '#ffd400' : '#1d9bf0'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - replyProgress)}
              />
            </svg>
            {replyText.length > 0 && replyCharsLeft <= 40 && (
              <span className={`absolute text-[10px] font-bold ${replyCharsLeft <= 20 ? 'text-[#ffd400]' : 'text-[#71767b]'}`}>
                {replyCharsLeft}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header móvil: ← | "Post" */}
      <div className="relative sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-[#181818] transition-colors cursor-pointer" title="Volver">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 font-extrabold text-[20px] text-white">Post</span>
        <span className="p-2 -mr-2 w-9" aria-hidden="true" />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Post principal */}
        <div className="p-4 border-b border-[#2f3336]">
          {/* Contexto de repost (ref 9.jpeg) */}
          {isReposted && (
            <div className="flex items-center gap-2 pl-[60px] pb-2 text-[13px] font-bold text-[#71767b]">
              <Repeat2 className="w-4 h-4" />
              <span>Tú reposteaste</span>
            </div>
          )}

          <div className="flex gap-3">
            {/* Columna del avatar + línea conectora del hilo */}
            <div className="flex flex-col items-center shrink-0">
              {post.is_anonymous ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1c1f23] to-[#0d0f12] border border-[#2f3336] flex items-center justify-center text-xl shadow-inner select-none">
                  🎭
                </div>
              ) : (
                <img
                  src={getSafeAvatarUrl(post.author.avatar_url)}
                  alt={post.author.display_name}
                  onClick={() => onSelectProfile(post.author.username)}
                  className="w-12 h-12 rounded-full object-cover border border-[#2f3336] cursor-pointer hover:opacity-90"
                />
              )}
              {replies.length > 0 && (
                <div className="w-[2px] flex-1 mt-2 rounded-full bg-[#2f3336]" aria-hidden="true" />
              )}
            </div>

            {/* Columna de contenido */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Autor: avatar 48px, nombre bold + @handle, botón "Seguir" blanco relleno, ⋮ */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col leading-tight min-w-0">
                  {post.is_anonymous ? (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[16px] text-white">
                          {post.anonymous_name || 'Anónimo'}
                        </span>
                        <span className="text-[11px] bg-[#1d9bf0]/15 text-[#1d9bf0] border border-[#1d9bf0]/30 px-2 py-0.5 rounded-full font-bold">
                          🎭 Modo Anónimo
                        </span>
                      </div>
                      <span className="text-[14px] text-[#71767b]">@anonimo</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <span
                          onClick={() => onSelectProfile(post.author.username)}
                          className="font-bold text-[16px] text-white hover:underline cursor-pointer"
                        >
                          {post.author.display_name}
                        </span>
                        {post.author.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                        )}
                      </div>
                      <span
                        onClick={() => onSelectProfile(post.author.username)}
                        className="text-[14px] text-[#71767b] hover:underline cursor-pointer"
                      >
                        @{post.author.username}
                      </span>
                    </>
                  )}
                </div>

                {/* Seguir (blanco relleno) y menú ⋮ */}
                <div className="flex items-center gap-2 relative shrink-0">
                  {!post.is_anonymous && post.author.id !== currentUser.id && (
                    <button
                      onClick={handleToggleFollow}
                      className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                        isFollowing
                          ? 'border border-[#536471] text-white hover:border-red-600 hover:text-red-600'
                          : 'bg-white text-black hover:bg-white/90'
                      }`}
                    >
                      {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>
                  )}

                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {showMenu && (
                    <div
                      className="absolute right-0 top-full mt-1 w-48 bg-black border border-[#2f3336] rounded-2xl shadow-2xl py-1.5 z-40 animate-pop-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigator.clipboard.writeText(window.location.href);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#e7e9ea] hover:bg-[#16181c] flex items-center gap-2.5 cursor-pointer"
                      >
                        <LinkIcon className="w-4 h-4 text-[#71767b]" />
                        <span>Copiar enlace</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onHide?.(post.id);
                          onBack();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#e7e9ea] hover:bg-[#16181c] flex items-center gap-2.5 cursor-pointer"
                      >
                        <EyeOff className="w-4 h-4 text-[#71767b]" />
                        <span>Ocultar post</span>
                      </button>

                      {(post.user_id === currentUser.id || currentUser.username === 'admin' || currentUser.id === 'admin') && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onDelete?.(post.id);
                            onBack();
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-[#16181c] flex items-center gap-2.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar post{currentUser.username === 'admin' && post.user_id !== currentUser.id ? ' (Admin)' : ''}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="mt-3 text-[17px] text-[#e7e9ea] leading-relaxed whitespace-pre-line break-words">
                {post.content}
              </div>

              {/* Media */}
              {post.media && post.media.length > 0 && (
                <div className="mt-3">
                  <MediaPreview media={post.media} />
                </div>
              )}

              {/* Poll */}
              {post.poll && (
                <PollView poll={post.poll} onVote={handleVote} />
              )}

              {/* Fecha completa */}
              <div className="py-3 mt-3 border-b border-[#2f3336] text-[15px] text-[#71767b] flex items-center gap-1.5">
                <span>{formatFullDate(post.created_at)}</span>
                <span>·</span>
                <span className="font-bold text-white">{formatNumber(post.views_count)}</span>
                <span>Reproducciones</span>
              </div>

              {/* Resumen de contadores */}
              <div className="py-3 border-b border-[#2f3336] flex items-center gap-4 sm:gap-6 text-[14px] text-[#71767b] flex-wrap">
                <div>
                  <span className="font-bold text-white mr-1">{formatNumber(repostsCount)}</span>
                  <span>Reposts</span>
                </div>
                <div>
                  <span className="font-bold text-white mr-1">{formatNumber(likesCount)}</span>
                  <span>Me gusta</span>
                </div>
                <div>
                  <span className="font-bold text-white mr-1">{formatNumber(post.bookmarks_count)}</span>
                  <span>Guardados</span>
                </div>
              </div>

              {/* Barra de acciones (ref "WhatsApp 21122026-10-18 at 5.58.29 PM.jpeg": icono + contador) */}
              <div className="py-1 border-b border-[#2f3336] flex items-center justify-around text-[#71767b] text-[13px]">
                <button
                  onClick={openReplyMode}
                  className="group flex items-center gap-1 hover:text-[#1d9bf0] transition-colors cursor-pointer"
                >
                  <span className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  <span>{formatNumber(post.replies_count)}</span>
                </button>
                <button
                  onClick={handleRepost}
                  className={`group flex items-center gap-1 hover:text-[#00ba7c] transition-colors cursor-pointer ${
                    isReposted ? 'text-[#00ba7c]' : ''
                  }`}
                >
                  <span className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                    <Repeat2 className="w-5 h-5" />
                  </span>
                  <span>{formatNumber(repostsCount)}</span>
                </button>
                <button
                  onClick={handleLike}
                  className={`group flex items-center gap-1 hover:text-[#f91880] transition-colors cursor-pointer ${
                    isLiked ? 'text-[#f91880]' : ''
                  }`}
                >
                  <span className="p-2 rounded-full group-hover:bg-[#f91880]/10 transition-colors">
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </span>
                  <span>{formatNumber(likesCount)}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  className={`group flex items-center gap-1 hover:text-[#1d9bf0] transition-colors cursor-pointer ${
                    isBookmarked ? 'text-[#1d9bf0]' : ''
                  }`}
                >
                  <span className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </span>
                  <span>{formatNumber(post.bookmarks_count)}</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors cursor-pointer"
                >
                  <Share className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hilo de respuestas con línea conectora vertical (ref "WhatsApp 21122026-10-18 at 5.58.29 PM.jpeg") */}
        {replies.length > 0 && (
          <div className="relative flex flex-col">
            <div className="absolute left-[40px] -translate-x-1/2 -top-4 h-7 w-[2px] bg-[#2f3336]" aria-hidden="true" />
            {replies.map((reply: any) => (
              <div
                key={reply.id}
                className="flex gap-3 px-4 py-3 border-b border-[#2f3336] hover:bg-[#080808] transition-colors"
              >
                <img
                  src={getSafeAvatarUrl(reply.author.avatar_url)}
                  alt={reply.author.display_name}
                  onClick={() => onSelectProfile(reply.author.username)}
                  className="relative w-12 h-12 rounded-full object-cover border border-[#2f3336] cursor-pointer shrink-0"
                />
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      onClick={() => onSelectProfile(reply.author.username)}
                      className="font-bold text-[15px] text-white hover:underline cursor-pointer"
                    >
                      {reply.author.display_name}
                    </span>
                    <span className="text-sm text-[#71767b]">@{reply.author.username}</span>
                  </div>
                  <p className="mt-1 text-[15px] text-[#e7e9ea] leading-normal">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer fijo al fondo: avatar 32px + píldora "Postea tu respuesta" + 📷 🎞️ ⛶ */}
      <div className="sticky bottom-[calc(52px_+_env(safe-area-inset-bottom))] sm:bottom-0 z-20 bg-black border-t border-[#2f3336] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <img
            src={getSafeAvatarUrl(currentUser.avatar_url)}
            alt={currentUser.display_name}
            className="w-8 h-8 rounded-full object-cover border border-[#2f3336] shrink-0"
          />
          <button
            onClick={openReplyMode}
            className="flex-1 min-w-0 text-left text-[15px] text-[#71767b] border border-[#2f3336] rounded-full px-4 py-2 hover:bg-[#16181c] transition-colors cursor-pointer truncate"
          >
            Postea tu respuesta
          </button>
          <div className="flex items-center gap-0.5 text-[#1d9bf0] shrink-0">
            <button
              onClick={openReplyMode}
              title="Añadir imagen"
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={openReplyMode}
              title="Añadir GIF"
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors cursor-pointer"
            >
              <Film className="w-5 h-5" />
            </button>
            <button
              onClick={openReplyMode}
              title="Ampliar respuesta"
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
