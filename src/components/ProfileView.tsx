import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  Share2,
  Repeat2,
  FileText,
  MessageCircle,
  PlaySquare,
  Heart,
  Ghost,
  Search,
  MoreHorizontal,
  Lock,
  BadgeCheck,
  ChevronRight,
  ChevronDown,
  Pencil,
  ListChecks,
  Cake,
} from 'lucide-react';
import { UserProfile, Post } from '../types';
import { fetchUserProfile, fetchPosts, toggleFollow, fetchRecommendations } from '../lib/api';
import { TweetCard } from './TweetCard';
import { formatNumber } from '../lib/utils';
import { EditProfileModal } from './EditProfileModal';
import { getSafeAvatarUrl } from '../lib/avatar';

interface ProfileViewProps {
  username: string;
  currentUser: UserProfile;
  onBack: () => void;
  onPostClick: (post: Post) => void;
  onSelectProfile: (username: string) => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onDelete?: (postId: string) => void;
  onHide?: (postId: string) => void;
  onOpenChat?: (user: UserProfile) => void;
  onOpenArticles?: () => void;
  onOpenAi?: () => void;
}

/**
 * La API puede devolver el flag de cuenta protegida aunque el tipo global
 * todavía no lo declare: se tipa aquí de forma local y opcional.
 */
type ProfileWithPrivacy = UserProfile & { is_protected?: boolean };

export const ProfileView: React.FC<ProfileViewProps> = ({
  username,
  currentUser,
  onBack,
  onPostClick,
  onSelectProfile,
  onProfileUpdated,
  onDelete,
  onHide,
  onOpenChat,
  onOpenArticles,
  onOpenAi,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'posts' | 'replies' | 'highlights' | 'articles' | 'media' | 'likes'
  >('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);
  const [showBannerMenu, setShowBannerMenu] = useState(false);
  const [recommendedUsers, setRecommendedUsers] = useState<UserProfile[]>([]);
  const [recommendedFollowing, setRecommendedFollowing] = useState<{ [id: string]: boolean }>({});

  const isMe = profile?.id === currentUser.id || username.toLowerCase() === currentUser.username.toLowerCase();
  const isProtected = Boolean((profile as ProfileWithPrivacy | null)?.is_protected);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await fetchUserProfile(username);
      setProfile(user);
      const userPosts = await fetchPosts(currentUser.id, 'for_you', username);
      setPosts(userPosts);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [username]);

  useEffect(() => {
    fetchRecommendations(currentUser.id)
      .then((users) => setRecommendedUsers(users))
      .catch(() => {});
  }, [currentUser.id]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const res = await toggleFollow(currentUser.id, profile.id);
      setIsFollowing(res.following);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followers_count: res.following
                ? prev.followers_count + 1
                : Math.max(0, prev.followers_count - 1),
            }
          : null
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecommendedFollow = async (userId: string) => {
    try {
      const res = await toggleFollow(currentUser.id, userId);
      setRecommendedFollowing((prev) => ({ ...prev, [userId]: res.following }));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center px-4 h-[53px]">
          <button onClick={onBack} className="p-2 -ml-2 mr-4 rounded-full hover:bg-[#181818]">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="font-bold text-xl text-white">Perfil</span>
        </div>
        <div className="p-8 text-center text-[#71767b]">Cargando perfil...</div>
      </div>
    );
  }

  const joinDate = new Date(profile.joined_at || Date.now()).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  // Cada pestaña filtra el contenido disponible (refs 9/11/12/13/15)
  const displayedPosts = posts.filter((post) => {
    switch (activeTab) {
      case 'replies':
        return Boolean(post.reply_to_id);
      case 'media':
        // Ref 12.jpeg: la pestaña "Videos" solo lista posts con video (no imágenes ni audio)
        return Boolean(post.media && post.media.some((m) => m.type === 'video'));
      case 'highlights':
        // Ref 9.jpeg: la pestaña "Reposts" lista lo que el usuario ha reposteado
        return Boolean(post.is_reposted);
      case 'likes':
        return Boolean(post.is_liked);
      case 'articles':
        return post.content.startsWith('📰');
      case 'posts':
        return !post.reply_to_id;
      default:
        return true;
    }
  });

  const handleShareProfile = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/@${profile.username}`
      );
      setProfileCopied(true);
      setTimeout(() => setProfileCopied(false), 1800);
    } catch {}
  };

  const renderEmptyState = () => {
    if (activeTab === 'media') {
      return (
        <div className="flex flex-col items-start px-8 py-12 max-w-md">
          <h3 className="text-[31px] font-extrabold text-white leading-tight">
            Luz, cámara... ¡adjuntos!
          </h3>
          <p className="mt-2 text-[15px] text-[#71767b] leading-relaxed">
            Tus posts de video aparecerán aquí.
          </p>
        </div>
      );
    }

    if (activeTab === 'articles') {
      return (
        <div className="flex flex-col items-start px-8 py-12 max-w-md">
          <h3 className="text-[31px] font-extrabold text-white leading-tight">
            Escribe artículos en Talma
          </h3>
          <p className="mt-2 text-[15px] text-[#71767b] leading-relaxed">
            Cuando publiques un Artículo en Talma, se mostrará aquí. Solo las personas suscritas a
            Premium pueden publicar Artículos.
          </p>
          <button
            type="button"
            className="mt-5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-[15px] rounded-full px-5 py-2.5 transition-colors cursor-pointer"
          >
            Suscríbete a Premium
          </button>
        </div>
      );
    }

    const emptyCopy: Record<string, { title: string; body: string }> = {
      replies: {
        title: isMe ? 'Aún no has respondido' : `@${profile.username} no ha respondido`,
        body: 'Cuando respondas a un post, aparecerá aquí.',
      },
      highlights: {
        title: 'Aún no hay Reposts',
        body: 'Cuando repostees un post, aparecerá aquí.',
      },
      likes: {
        title: 'Aún no hay Me gusta',
        body: 'Cuando te guste un post, aparecerá aquí.',
      },
    };
    const copy = emptyCopy[activeTab];

    if (copy) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto">
          <h3 className="text-[26px] font-extrabold text-white leading-tight mb-2">{copy.title}</h3>
          <p className="text-[15px] text-[#71767b]">{copy.body}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto">
        <h3 className="text-[26px] font-extrabold text-white leading-tight mb-2">
          {isMe ? 'Aún no tienes publicaciones' : `@${profile.username} no ha publicado nada`}
        </h3>
        <p className="text-[15px] text-[#71767b]">
          {isMe
            ? 'Cuando publiques fotos, videos, audios o textos, aparecerán aquí.'
            : 'Las publicaciones compartidas se mostrarán aquí cuando estén disponibles.'}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Sticky header (desktop only — mobile uses the overlay on the banner like the X app) */}
      <div className="hidden sm:flex sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] items-center px-4 h-[53px]">
        <button
          onClick={onBack}
          className="p-2 -ml-2 mr-4 rounded-full hover:bg-[#181818] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1">
            <span className="font-bold text-xl text-white truncate max-w-[240px]">
              {profile.display_name}
            </span>
            {profile.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black" />
            )}
            {isProtected && <Lock className="w-3.5 h-3.5 text-[#71767b] shrink-0" />}
          </div>
          <span className="text-xs text-[#71767b]">{posts.length} publicaciones</span>
        </div>
      </div>

      {/* Banner with mobile overlay controls (X app style) */}
      <div className="h-[136px] sm:h-48 md:h-56 bg-[#2f3336] relative overflow-hidden">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-emerald-950 via-black to-[#16181c]" />
        )}

        {/* Overlay con 4 círculos negros semitransparentes (ref 7.jpeg / Image12122) */}
        <div className="sm:hidden absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
          <button
            onClick={onBack}
            aria-label="Volver"
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAi?.()}
              aria-label="Abrir Talma AI"
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <Ghost className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              aria-label="Buscar en el perfil"
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowBannerMenu((v) => !v)}
                aria-label="Más opciones"
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Menú ⋯ (ref 8.jpeg): Borradores / Listas en las que estás */}
              {showBannerMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowBannerMenu(false)}
                  />
                  <div className="absolute right-0 top-11 z-40 w-[224px] bg-[#16181c] rounded-2xl shadow-2xl shadow-black/60 border border-[#2f3336] overflow-hidden animate-fade-in py-1">
                    <button
                      onClick={() => {
                        setShowBannerMenu(false);
                        onOpenArticles?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-[#e7e9ea] font-normal hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                    >
                      <Pencil className="w-[18px] h-[18px] text-[#e7e9ea] shrink-0" />
                      <span>Borradores</span>
                    </button>
                    <button
                      onClick={() => setShowBannerMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-[#e7e9ea] font-normal hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                    >
                      <ListChecks className="w-[18px] h-[18px] text-[#e7e9ea] shrink-0" />
                      <span>Listas en las que estás</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar & Edit / Follow buttons */}
      <div className="px-4 relative flex justify-between items-end pb-3">
        {/* Avatar positioned over banner */}
        <div className="-mt-10 sm:-mt-16 md:-mt-20 relative">
          <img
            src={getSafeAvatarUrl(profile.avatar_url)}
            alt={profile.display_name}
            className="w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-black bg-black shadow-xl"
          />
        </div>

        {/* Action Button (desktop) */}
        <div className="pt-3 hidden sm:block">
          {isMe ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="border border-[#536471] hover:bg-white/10 text-white font-bold px-4 py-1.5 rounded-full text-[14px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Editar perfil</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenChat?.(profile)}
                className="border border-[#536471] hover:bg-white/10 text-white font-bold px-4 py-1.5 rounded-full text-[14px] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mensaje</span>
              </button>
              <button
                onClick={handleFollowToggle}
                className={`font-bold px-4 py-1.5 rounded-full text-[14px] transition-colors cursor-pointer ${
                  isFollowing
                    ? 'border border-[#536471] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
                    : 'bg-white text-black hover:bg-[#d7dbdc]'
                }`}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info Details */}
      <div className="px-4 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-xl font-extrabold text-white">{profile.display_name}</h1>
            {profile.is_verified && (
              <CheckCircle2 className="w-5 h-5 text-[#1d9bf0] fill-[#1d9bf0] stroke-black" />
            )}
            {isProtected && (
              <Lock className="w-4 h-4 text-[#e7e9ea] shrink-0" aria-label="Cuenta protegida" />
            )}
            {isMe && (
              <button
                onClick={() => setShowEditModal(true)}
                className="ml-1 flex items-center gap-1 border border-[#2f3336] hover:bg-white/[0.06] text-[#e7e9ea] rounded-full pl-2 pr-3 py-1 text-[14px] font-bold transition-colors cursor-pointer shrink-0"
              >
                <BadgeCheck className="w-4 h-4 text-[#1d9bf0] shrink-0" />
                <span className="whitespace-nowrap">Obtener verificación</span>
              </button>
            )}
          </div>
          <span className="text-sm text-[#71767b]">@{profile.username}</span>
          {!isMe && (
            <button
              type="button"
              className="mt-1 flex items-center gap-1 text-[13px] text-[#1d9bf0] hover:underline cursor-pointer"
            >
              <Ghost className="w-3.5 h-3.5" />
              <span>Mostrar traducción</span>
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="text-[15px] text-[#e7e9ea] leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>
        )}

        {/* Metadata: Location, Website, Join Date */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs md:text-sm text-[#71767b]">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-1">
              <LinkIcon className="w-4 h-4" />
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-[#1d9bf0] hover:underline"
              >
                {profile.website.replace('https://', '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Cake className="w-4 h-4" />
            <span>Fecha de nacimiento: marzo 23, 1998</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Se unió en {joinDate}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Followers / Following counts */}
        <div className="flex items-center gap-5 text-sm pt-1">
          <div className="flex items-center gap-1 cursor-pointer hover:underline">
            <span className="font-bold text-white">{formatNumber(profile.following_count)}</span>
            <span className="text-[#71767b]">Siguiendo</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:underline">
            <span className="font-bold text-white">{formatNumber(profile.followers_count)}</span>
            <span className="text-[#71767b]">Seguidores</span>
          </div>
        </div>
      </div>

      {/* Mobile action row: perfil propio = Compartir + Editar; ajeno = Mensaje + Seguir */}
      <div className="flex sm:hidden gap-2 px-4 pt-1">
        {isMe ? (
          <>
            <button
              onClick={handleShareProfile}
              className="flex-1 border border-[#536471] hover:bg-white/10 text-white font-bold py-2.5 rounded-full text-[15px] transition-colors flex items-center justify-center gap-2"
            >
              {profileCopied ? (
                <CheckCircle2 className="w-4 h-4 text-[#1d9bf0]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>{profileCopied ? 'Copiado' : 'Compartir'}</span>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 border border-[#536471] hover:bg-white/10 text-white font-bold py-2.5 rounded-full text-[15px] transition-colors"
            >
              Editar perfil
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onOpenChat?.(profile)}
              className="flex-1 border border-[#536471] hover:bg-white/10 text-white font-bold py-2.5 rounded-full text-[15px] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Mensaje</span>
            </button>
            <button
              onClick={handleFollowToggle}
              className={`flex-1 font-bold py-2.5 rounded-full text-[15px] transition-colors ${
                isFollowing
                  ? 'border border-[#536471] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
                  : 'bg-white text-black hover:bg-[#d7dbdc]'
              }`}
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
          </>
        )}
      </div>

      {/* Mobile tabs: X app icon tabs (active tab expands with its label) */}
      <div className="flex sm:hidden border-b border-[#2f3336] mt-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'posts', label: 'Posts', icon: FileText },
          { id: 'replies', label: 'Respuestas', icon: MessageCircle },
          { id: 'highlights', label: 'Reposts', icon: Repeat2 },
          { id: 'media', label: 'Videos', icon: PlaySquare },
          { id: 'articles', label: 'Artículos', icon: FileText },
          { id: 'likes', label: 'Me gusta', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              aria-label={tab.label}
              className={`flex items-center justify-center gap-1.5 px-5 py-3.5 shrink-0 relative transition-colors ${
                isActive ? 'text-white' : 'text-[#71767b]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              {isActive && (
                <>
                  <span className="text-[13px] font-bold whitespace-nowrap">{tab.label}</span>
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
              {isActive && (
                <div className="absolute bottom-0 inset-x-2 h-[4px] bg-[#e7e9ea] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:flex border-b border-[#2f3336] mt-4">
        {[
          { id: 'posts', label: 'Publicaciones' },
          { id: 'replies', label: 'Respuestas' },
          { id: 'highlights', label: 'Reposts' },
          { id: 'media', label: 'Fotos y videos' },
          { id: 'articles', label: 'Artículos' },
          { id: 'likes', label: 'Me gusta' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 min-w-[100px] py-3.5 text-center hover:bg-[#181818] transition-colors relative cursor-pointer"
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
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-14 bg-[#e7e9ea] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="flex flex-col">
        {displayedPosts.length === 0 ? (
          renderEmptyState()
        ) : (
          displayedPosts.map((post) => (
            <TweetCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onPostClick={onPostClick}
              onSelectProfile={onSelectProfile}
              onDelete={onDelete}
              onHide={onHide}
              repostContext={post.is_reposted ? 'Tú reposteaste' : undefined}
            />
          ))
        )}
      </div>

      {/* A quién seguir — carrusel horizontal (refs 12/13/15) */}
      {recommendedUsers.length > 0 && (
        <section className="mt-6 border-t border-[#2f3336] pt-4">
          <h2 className="font-extrabold text-[20px] text-[#e7e9ea] px-4 pb-3">
            A quién seguir
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-4 snap-x">
            {recommendedUsers.map((user) => {
              const isRecommendedFollowing = Boolean(recommendedFollowing[user.id]);
              return (
                <div
                  key={user.id}
                  className="w-[160px] shrink-0 snap-start bg-[#16181c] rounded-2xl overflow-hidden border border-[#2f3336]"
                >
                  <button
                    onClick={() => onSelectProfile(user.username)}
                    className="block w-full text-left cursor-pointer"
                  >
                    <div className="h-[64px] bg-[#2f3336] overflow-hidden">
                      {user.banner_url ? (
                        <img
                          src={user.banner_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-emerald-950 via-black to-[#16181c]" />
                      )}
                    </div>
                    <div className="px-3 -mt-6">
                      <img
                        src={getSafeAvatarUrl(user.avatar_url)}
                        alt={user.display_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-black bg-black"
                      />
                    </div>
                    <div className="px-3 pt-1.5 pb-3">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-bold text-[15px] text-[#e7e9ea] truncate">
                          {user.display_name}
                        </span>
                        {user.is_verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#1d9bf0] fill-[#1d9bf0] stroke-black" />
                        )}
                      </div>
                      <span className="block text-[13px] text-[#71767b] truncate">
                        @{user.username}
                      </span>
                    </div>
                  </button>
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => handleRecommendedFollow(user.id)}
                      className={`w-full font-bold py-1.5 rounded-full text-[14px] transition-colors cursor-pointer ${
                        isRecommendedFollowing
                          ? 'border border-[#536471] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
                          : 'bg-white text-black hover:bg-[#d7dbdc]'
                      }`}
                    >
                      {isRecommendedFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            setProfile(updated);
            if (isMe) onProfileUpdated(updated);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};
