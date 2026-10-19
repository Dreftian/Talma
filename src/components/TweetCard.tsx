import React, { useState } from 'react';
import {
  MessageSquare,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  EyeOff,
  Link as LinkIcon,
} from 'lucide-react';
import { Post, UserProfile } from '../types';
import { formatRelativeTime, formatNumber } from '../lib/utils';
import { toggleLike, toggleRepost, toggleBookmark, votePoll } from '../lib/api';
import { MediaPreview } from './MediaPreview';
import { PollView } from './PollView';
import { getSafeAvatarUrl } from '../lib/avatar';

interface TweetCardProps {
  post: Post;
  currentUser: UserProfile;
  onPostClick?: (post: Post) => void;
  onSelectProfile?: (username: string) => void;
  onDelete?: (postId: string) => void;
  onHide?: (postId: string) => void;
  onReply?: (post: Post) => void;
  /** Optional context line shown above the post, e.g. "Tú reposteaste" (refs 9.jpeg). */
  repostContext?: string;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  post,
  currentUser,
  onPostClick,
  onSelectProfile,
  onDelete,
  onHide,
  onReply,
  repostContext,
}) => {
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLiked, setIsLiked] = useState(post.is_liked ?? false);
  const [repostsCount, setRepostsCount] = useState(post.reposts_count);
  const [isReposted, setIsReposted] = useState(post.is_reposted ?? false);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked ?? false);
  const [poll, setPoll] = useState(post.poll);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleLike(post.id, currentUser.id);
      setIsLiked(res.liked);
      setLikesCount(res.count);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleRepost(post.id, currentUser.id);
      setIsReposted(res.reposted);
      setRepostsCount(res.count);
    } catch (err) {
      console.error('Repost error:', err);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleBookmark(post.id, currentUser.id);
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleVote = async (optionId: number) => {
    try {
      const updatedPoll = await votePoll(post.id, optionId, currentUser.id);
      setPoll(updatedPoll);
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + '/post/' + post.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('#') && part.length > 1) {
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-[#1d9bf0] hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('@') && part.length > 1) {
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onSelectProfile?.(part.replace('@', ''));
            }}
            className="text-[#1d9bf0] hover:underline cursor-pointer font-medium"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#1d9bf0] hover:underline cursor-pointer break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <article
      onClick={() => onPostClick?.(post)}
      className="border-b border-[#2f3336] hover:bg-[#080808] transition-colors duration-150 cursor-pointer select-none relative"
    >
      {repostContext && (
        <div className="flex items-center gap-2 pl-[52px] pr-4 pt-2 text-[13px] font-bold text-[#71767b]">
          <Repeat2 className="w-4 h-4" />
          <span>{repostContext}</span>
        </div>
      )}
      <div className="flex gap-3 px-4 py-3.5">
      {/* Author Avatar */}
      <div className="shrink-0">
        {post.is_anonymous ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1c1f23] to-[#0d0f12] border border-[#2f3336] flex items-center justify-center text-lg shadow-inner select-none">
            🎭
          </div>
        ) : (
          <img
            src={getSafeAvatarUrl(post.author.avatar_url)}
            alt={post.author.display_name}
            onClick={(e) => {
              e.stopPropagation();
              onSelectProfile?.(post.author.username);
            }}
            className="w-10 h-10 rounded-full object-cover border border-[#2f3336] hover:opacity-90 transition-opacity"
          />
        )}
      </div>

      {/* Main post container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header: Author info, timestamp, and menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            {post.is_anonymous ? (
              <>
                <span className="font-bold text-[15px] text-[#e7e9ea] truncate">
                  {post.anonymous_name || 'Anónimo'}
                </span>
                <span className="text-[11px] bg-[#1d9bf0]/15 text-[#1d9bf0] border border-[#1d9bf0]/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  🎭 Modo Anónimo
                </span>
                {post.is_extalmita && (
                  <span className="text-[11px] bg-[#1d9bf0]/15 text-[#1d9bf0] border border-[#1d9bf0]/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    🌐 Extalmita
                  </span>
                )}
                <span className="text-[14px] text-[#71767b]">@anonimo</span>
              </>
            ) : (
              <>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProfile?.(post.author.username);
                  }}
                  className="font-bold text-[15px] text-[#e7e9ea] hover:underline truncate"
                >
                  {post.author.display_name}
                </span>

                {post.author.is_verified && (
                  <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                )}

                {post.is_extalmita && (
                  <span className="text-[11px] bg-[#1d9bf0]/15 text-[#1d9bf0] border border-[#1d9bf0]/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    🌐 Extalmita
                  </span>
                )}

                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProfile?.(post.author.username);
                  }}
                  className="text-[14px] text-[#71767b] truncate"
                >
                  @{post.author.username}
                </span>
              </>
            )}

            <span className="text-[14px] text-[#71767b]">·</span>

            <span className="text-[14px] text-[#71767b] hover:underline whitespace-nowrap">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>

          {/* More options, mirroring the reference post header */}
          <div className="flex items-center gap-0.5 shrink-0">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-48 bg-black border border-[#2f3336] rounded-2xl shadow-2xl py-1.5 z-40 animate-pop-in"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleShare({ stopPropagation: () => {} } as any);
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
        </div>

        {/* Text Content */}
        {post.content && (
          <p className="mt-1 text-[15px] text-[#e7e9ea] leading-normal whitespace-pre-line break-words">
            {renderContent(post.content)}
          </p>
        )}

        {/* Media Attachments */}
        {post.media && post.media.length > 0 && (
          <MediaPreview media={post.media} />
        )}

        {/* Poll Component */}
        {poll && (
          <PollView poll={poll} onVote={handleVote} />
        )}

        {/* Action icons bar */}
        <div className="flex items-center justify-between text-[#71767b] mt-3 max-w-[440px]">
          {/* Reply */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReply?.(post);
            }}
            className="flex items-center gap-1.5 group transition-colors"
          >
            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-xs group-hover:text-[#1d9bf0]">
              {formatNumber(post.replies_count)}
            </span>
          </button>

          {/* Repost */}
          <button
            onClick={handleRepost}
            className={`flex items-center gap-1.5 group transition-colors ${
              isReposted ? 'text-[#00ba7c]' : ''
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 group-hover:text-[#00ba7c] transition-colors">
              <Repeat2 className="w-4 h-4" />
            </div>
            <span className="text-xs group-hover:text-[#00ba7c]">
              {formatNumber(repostsCount)}
            </span>
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 group transition-colors ${
              isLiked ? 'text-[#f91880]' : ''
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-[#f91880]/10 group-hover:text-[#f91880] transition-colors">
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${
                  isLiked ? 'fill-current scale-110' : ''
                }`}
              />
            </div>
            <span className="text-xs group-hover:text-[#f91880]">
              {formatNumber(likesCount)}
            </span>
          </button>

          {/* Views */}
          <div className="flex items-center gap-1.5 group cursor-default">
            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] transition-colors">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-xs group-hover:text-[#1d9bf0]">
              {formatNumber(post.views_count)}
            </span>
          </div>

          {/* Bookmark & Share */}
          <div className="flex items-center">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors ${
                isBookmarked ? 'text-[#1d9bf0]' : ''
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors"
              title="Compartir"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Copied toast notice */}
        {copied && (
          <div className="absolute bottom-2 right-4 bg-[#1d9bf0] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            ¡Enlace copiado!
          </div>
        )}
        </div>
      </div>
    </article>
  );
};
