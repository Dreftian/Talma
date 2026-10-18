import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Film,
  Music,
  BarChart2,
  Smile,
  Globe,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, MediaAttachment } from '../types';
import { uploadMedia, createPost } from '../lib/api';
import { MediaPreview } from './MediaPreview';

interface TweetComposerProps {
  currentUser: UserProfile;
  onPostCreated: (post: any) => void;
  replyToId?: string;
  placeholder?: string;
  compact?: boolean;
}

export const TweetComposer: React.FC<TweetComposerProps> = ({
  currentUser,
  onPostCreated,
  replyToId,
  placeholder = '¿Qué está pasando?',
  compact = false,
}) => {
  const [content, setContent] = useState('');
  const [mediaList, setMediaList] = useState<MediaAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const MAX_CHARS = 280;
  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit = (content.trim().length > 0 || mediaList.length > 0 || (showPoll && pollOptions.every(o => o.trim()))) && !isOverLimit && !isUploading && !isSubmitting;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await uploadMedia(file);
        setMediaList((prev) => [...prev, uploaded]);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage('Error al subir archivo a Supabase Storage: ' + (err.message || ''));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const next = [...pollOptions];
    next[index] = val;
    setPollOptions(next);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let pollData = null;
      if (showPoll) {
        pollData = {
          options: pollOptions.filter((o) => o.trim()).map((text) => ({ text })),
        };
      }

      const post = await createPost({
        user_id: currentUser.id,
        content,
        media: mediaList,
        poll: pollData,
        reply_to_id: replyToId,
      });

      setContent('');
      setMediaList([]);
      setShowPoll(false);
      setPollOptions(['', '']);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      onPostCreated(post);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex gap-3 px-4 py-3 border-b border-[#2f3336] bg-black ${compact ? 'border-none p-0' : ''}`}>
      {/* User Avatar */}
      <img
        src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
        alt={currentUser.display_name}
        className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#2f3336]"
      />

      <div className="flex-1 flex flex-col">
        {/* Audience Selector pill */}
        {!compact && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#22c55e] border border-[#2f3336] rounded-full px-3 py-1 w-fit mb-2 cursor-pointer hover:bg-[#22c55e]/10 transition-colors">
            <Globe className="w-3.5 h-3.5" />
            <span>Cualquiera puede responder</span>
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          className="w-full bg-transparent text-[#e7e9ea] text-[19px] placeholder-[#71767b] outline-none resize-none leading-relaxed"
        />

        {/* Error notice */}
        {errorMessage && (
          <div className="text-red-400 text-sm mt-1 px-2 py-1 bg-red-950/30 rounded border border-red-800">
            {errorMessage}
          </div>
        )}

        {/* Uploading progress indicator */}
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-[#22c55e] py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Subiendo multimedia a Supabase Storage...</span>
          </div>
        )}

        {/* Media Preview */}
        {mediaList.length > 0 && (
          <MediaPreview media={mediaList} onRemove={handleRemoveMedia} isComposer />
        )}

        {/* Poll creator */}
        {showPoll && (
          <div className="mt-3 p-3 bg-[#16181c] rounded-2xl border border-[#2f3336] flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#2f3336]">
              <span className="text-sm font-bold text-[#e7e9ea]">Crear encuesta</span>
              <button
                onClick={() => setShowPoll(false)}
                className="text-[#71767b] hover:text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {pollOptions.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Opción ${i + 1}`}
                value={opt}
                onChange={(e) => handlePollOptionChange(i, e.target.value)}
                maxLength={40}
                className="bg-black/60 border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-[#e7e9ea] focus:border-[#22c55e] outline-none"
              />
            ))}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="text-xs font-bold text-[#22c55e] hover:underline self-start mt-1"
              >
                + Añadir otra opción
              </button>
            )}
          </div>
        )}

        {/* Toolbar & Post button */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#2f3336]">
          {/* File input helpers */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            className="hidden"
          />
          <input
            type="file"
            ref={audioInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />

          <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#22c55e] hover:bg-[#22c55e]/10 rounded-full transition-colors cursor-pointer"
              title="Foto / Imagen a Supabase"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="p-2 text-[#22c55e] hover:bg-[#22c55e]/10 rounded-full transition-colors cursor-pointer"
              title="Video a Supabase"
            >
              <Film className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="p-2 text-[#22c55e] hover:bg-[#22c55e]/10 rounded-full transition-colors cursor-pointer"
              title="Nota de audio a Supabase"
            >
              <Music className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="p-2 text-[#22c55e] hover:bg-[#22c55e]/10 rounded-full transition-colors cursor-pointer"
              title="Encuesta"
            >
              <BarChart2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setContent((prev) => prev + ' 🚀')}
              className="p-2 text-[#22c55e] hover:bg-[#22c55e]/10 rounded-full transition-colors cursor-pointer"
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <span
                className={`text-xs ${
                  isOverLimit
                    ? 'text-red-500 font-bold'
                    : charsLeft <= 20
                    ? 'text-yellow-500'
                    : 'text-[#71767b]'
                }`}
              >
                {charsLeft}
              </span>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`font-bold px-4 py-1.5 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5 ${
                canSubmit
                  ? 'bg-[#22c55e] hover:bg-[#16a34a] text-black active:scale-95 shadow-sm'
                  : 'bg-[#22c55e]/40 text-black/60 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posteando...</span>
                </>
              ) : (
                <span>Postear</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
