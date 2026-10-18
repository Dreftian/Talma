import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  Edit3,
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
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  username,
  currentUser,
  onBack,
  onPostClick,
  onSelectProfile,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Sticky Header with name and posts count */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center px-4 h-[53px]">
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

      {/* Banner */}
      <div className="h-48 md:h-56 bg-[#2f3336] relative overflow-hidden">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-emerald-950 via-black to-[#16181c]" />
        )}
      </div>

      {/* Avatar & Edit / Follow buttons */}
      <div className="px-4 relative flex justify-between items-end pb-3">
        {/* Avatar positioned over banner */}
        <div className="-mt-12 sm:-mt-16 md:-mt-20 relative">
          <img
            src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
            alt={profile.display_name}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-black bg-black shadow-xl"
          />
        </div>

        {/* Action Button */}
        <div className="pt-3">
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

      {/* Tabs bar */}
      <div className="flex border-b border-[#2f3336] mt-4 overflow-x-auto no-scrollbar">
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
          <div className="p-12 text-center text-[#71767b]">
            @{profile.username} aún no ha publicado nada en esta sección.
          </div>
        ) : (
          posts.map((post) => (
            <TweetCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onPostClick={onPostClick}
              onSelectProfile={onSelectProfile}
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
