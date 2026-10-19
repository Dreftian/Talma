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
} from 'lucide-react';
import { UserProfile, Post } from '../types';
import { fetchUserProfile, fetchPosts, toggleFollow } from '../lib/api';
import { TweetCard } from './TweetCard';
import { formatNumber } from '../lib/utils';
import { EditProfileModal } from './EditProfileModal';

interface ProfileViewProps {
  username: string;
  currentUser: UserProfile;
  onBack: () => void;
  onPostClick: (post: Post) => void;
  onSelectProfile: (username: string) => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onDelete?: (postId: string) => void;
  onHide?: (postId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  username,
  currentUser,
  onBack,
  onPostClick,
  onSelectProfile,
  onProfileUpdated,
  onDelete,
  onHide,
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

  const isMe = profile?.id === currentUser.id || username.toLowerCase() === currentUser.username.toLowerCase();

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

  const handleShareProfile = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/@${profile.username}`
      );
      setProfileCopied(true);
      setTimeout(() => setProfileCopied(false), 1800);
    } catch {}
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

        <div className="sm:hidden absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
          <button
            onClick={onBack}
            aria-label="Volver"
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleShareProfile}
            aria-label="Compartir perfil"
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            {profileCopied ? (
              <CheckCircle2 className="w-5 h-5 text-[#1d9bf0]" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Avatar & Edit / Follow buttons */}
      <div className="px-4 relative flex justify-between items-end pb-3">
        {/* Avatar positioned over banner */}
        <div className="-mt-10 sm:-mt-16 md:-mt-20 relative">
          <img
            src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
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
          )}
        </div>
      </div>

      {/* Profile Info Details */}
      <div className="px-4 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-extrabold text-white">{profile.display_name}</h1>
            {profile.is_verified && (
              <CheckCircle2 className="w-5 h-5 text-[#1d9bf0] fill-[#1d9bf0] stroke-black" />
            )}
          </div>
          <span className="text-sm text-[#71767b]">@{profile.username}</span>
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
            <Calendar className="w-4 h-4" />
            <span>Se unió en {joinDate}</span>
          </div>
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

      {/* Mobile action row: Compartir + Editar/Seguir (X app style) */}
      <div className="flex sm:hidden gap-2 px-4 pt-1">
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
        {isMe ? (
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 border border-[#536471] hover:bg-white/10 text-white font-bold py-2.5 rounded-full text-[15px] transition-colors"
          >
            Editar perfil
          </button>
        ) : (
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
        )}
      </div>

      {/* Mobile tabs: X app icon tabs (active tab expands with its label) */}
      <div className="flex sm:hidden border-b border-[#2f3336] mt-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'posts', label: 'Posts', icon: FileText },
          { id: 'replies', label: 'Respuestas', icon: MessageCircle },
          { id: 'highlights', label: 'Destacados', icon: Repeat2 },
          { id: 'articles', label: 'Artículos', icon: FileText },
          { id: 'media', label: 'Fotos', icon: PlaySquare },
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
                <span className="text-[13px] font-bold whitespace-nowrap">{tab.label}</span>
              )}
              {isActive && (
                <div className="absolute bottom-0 inset-x-2 h-[4px] bg-[#1d9bf0] rounded-full" />
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
          { id: 'highlights', label: 'Destacados' },
          { id: 'articles', label: 'Artículos' },
          { id: 'media', label: 'Fotos y videos' },
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
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] w-14 bg-[#1d9bf0] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="flex flex-col">
        {posts.length === 0 ? (
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
        ) : (
          posts.map((post) => (
            <TweetCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onPostClick={onPostClick}
              onSelectProfile={onSelectProfile}
              onDelete={onDelete}
              onHide={onHide}
            />
          ))
        )}
      </div>

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
