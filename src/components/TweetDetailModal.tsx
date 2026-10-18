import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Heart, Repeat2, Bookmark, Share, MessageSquare, BarChart2 } from 'lucide-react';
import { Post, UserProfile } from '../types';
import { formatFullDate, formatNumber } from '../lib/utils';
import { fetchPostById, toggleLike, toggleRepost, toggleBookmark, votePoll } from '../lib/api';
import { MediaPreview } from './MediaPreview';
import { PollView } from './PollView';
import { TweetComposer } from './TweetComposer';

interface TweetDetailModalProps {
  postId: string;
  currentUser: UserProfile;
  onBack: () => void;
  onSelectProfile: (username: string) => void;
}

export const TweetDetailModal: React.FC<TweetDetailModalProps> = ({
  postId,
  currentUser,
  onBack,
  onSelectProfile,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isReposted, setIsReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
    } catch (err) {
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

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

  if (loading || !post) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center px-4 h-[53px]">
          <button onClick={onBack} className="p-2 -ml-2 mr-4 rounded-full hover:bg-[#181818]">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="font-bold text-xl text-white">Post</span>
        </div>
        <div className="p-8 text-center text-[#71767b]">Cargando post...</div>
      </div>
    );
  }

  const replies = (post as any).replies || [];

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Sticky header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center px-4 h-[53px]">
        <button onClick={onBack} className="p-2 -ml-2 mr-4 rounded-full hover:bg-[#181818] transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="font-bold text-xl text-white">Post</span>
      </div>

      {/* Main post body */}
      <div className="p-4 border-b border-[#2f3336]">
        {/* Author info */}
        <div className="flex items-center gap-3">
          {post.is_anonymous ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1c1f23] to-[#0d0f12] border border-[#2f3336] flex items-center justify-center text-xl shadow-inner select-none shrink-0">
              🎭
            </div>
          ) : (
            <img
              src={post.author.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={post.author.display_name}
              onClick={() => onSelectProfile(post.author.username)}
              className="w-12 h-12 rounded-full object-cover border border-[#2f3336] cursor-pointer hover:opacity-90 shrink-0"
            />
          )}
          <div className="flex flex-col leading-tight">
            {post.is_anonymous ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[16px] text-white">
                    {post.anonymous_name || 'Anónimo'}
                  </span>
                  <span className="text-[11px] bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 px-2 py-0.5 rounded-full font-bold">
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
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e] fill-[#22c55e] stroke-black shrink-0" />
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
        </div>

        {/* Content */}
        <div className="mt-4 text-[17px] text-[#e7e9ea] leading-relaxed whitespace-pre-line">
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

        {/* Full Date */}
        <div className="py-3 mt-3 border-b border-[#2f3336] text-[15px] text-[#71767b] flex items-center gap-1.5">
          <span>{formatFullDate(post.created_at)}</span>
          <span>·</span>
          <span className="font-bold text-white">{formatNumber(post.views_count)}</span>
          <span>Reproducciones</span>
        </div>

        {/* Counts summary bar */}
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

        {/* Action icons bar */}
        <div className="py-2 border-b border-[#2f3336] flex items-center justify-around text-[#71767b]">
          <button className="p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={handleRepost}
            className={`p-2 rounded-full hover:bg-[#00ba7c]/10 hover:text-[#00ba7c] transition-colors ${
              isReposted ? 'text-[#00ba7c]' : ''
            }`}
          >
            <Repeat2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleLike}
            className={`p-2 rounded-full hover:bg-[#f91880]/10 hover:text-[#f91880] transition-colors ${
              isLiked ? 'text-[#f91880]' : ''
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors ${
              isBookmarked ? 'text-[#1d9bf0]' : ''
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reply Composer */}
      <div className="border-b border-[#2f3336]">
        <div className="px-4 pt-2 text-xs text-[#71767b]">
          Respondiendo a <span className="text-[#22c55e]">@{post.author.username}</span>
        </div>
        <TweetComposer
          currentUser={currentUser}
          replyToId={post.id}
          placeholder="Postea tu respuesta"
          onPostCreated={() => loadPost()}
        />
      </div>

      {/* Replies Thread */}
      <div className="flex flex-col">
        {replies.map((reply: any) => (
          <div
            key={reply.id}
            className="flex gap-3 px-4 py-3 border-b border-[#2f3336] hover:bg-[#080808] transition-colors"
          >
            <img
              src={reply.author.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={reply.author.display_name}
              onClick={() => onSelectProfile(reply.author.username)}
              className="w-10 h-10 rounded-full object-cover border border-[#2f3336] cursor-pointer"
            />
            <div className="flex-1 flex flex-col">
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
    </div>
  );
};
