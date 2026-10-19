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
  Mic,
  Square,
  Upload,
} from 'lucide-react';
import { UserProfile, MediaAttachment } from '../types';
import { uploadMedia, createPost } from '../lib/api';
import { MediaPreview } from './MediaPreview';
import { getSafeAvatarUrl } from '../lib/avatar';

interface TweetComposerProps {
  currentUser: UserProfile;
  onPostCreated: (post: any) => void;
  replyToId?: string;
  placeholder?: string;
  compact?: boolean;
  isExtalmita?: boolean;
}

const PRESET_GIFS = [
  { name: 'Let\'s Go / Fuego', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { name: 'Celebración', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
  { name: 'Aplausos', url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif' },
  { name: 'Mente Explotada', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { name: 'Risa / LOL', url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif' },
  { name: 'Aprobado / Top', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
  { name: 'Gato Bailando', url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif' },
  { name: 'Programando / Hacker', url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif' },
];

export const TweetComposer: React.FC<TweetComposerProps> = ({
  currentUser,
  onPostCreated,
  replyToId,
  placeholder = '¿Qué está pasando?',
  compact = false,
  isExtalmita = false,
}) => {
  const [content, setContent] = useState('');
  const [mediaList, setMediaList] = useState<MediaAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Anonymous posting mode and custom anonymous name
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState('Anónimo');
  const [showAnonymousNameInput, setShowAnonymousNameInput] = useState(false);
  const [postToExtalmita, setPostToExtalmita] = useState(isExtalmita);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const gifInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const MAX_CHARS = 1000;
  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit =
    (content.trim().length > 0 || mediaList.length > 0 || (showPoll && pollOptions.every((o) => o.trim()))) &&
    !isOverLimit &&
    !isUploading &&
    !isSubmitting;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, explicitType?: 'image' | 'video' | 'audio' | 'gif') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatus(`Subiendo ${file.name}...`);
        const uploaded = await uploadMedia(file);
        if (explicitType) {
          uploaded.type = explicitType;
        }
        setMediaList((prev) => [...prev, uploaded]);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage('Error al subir archivo: ' + (err.message || 'Error de conexión'));
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (gifInputRef.current) gifInputRef.current.value = '';
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleSelectPresetGif = (gif: { name: string; url: string }) => {
    setMediaList((prev) => [
      ...prev,
      {
        url: gif.url,
        type: 'gif',
        name: gif.name,
      },
    ]);
    setShowGifPicker(false);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearInterval(timerIntervalRef.current);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `nota_voz_${Date.now()}.webm`, { type: 'audio/webm' });

        setIsUploading(true);
        setUploadStatus('Subiendo nota de voz...');
        try {
          const uploaded = await uploadMedia(audioFile);
          uploaded.type = 'audio';
          setMediaList((prev) => [...prev, uploaded]);
        } catch (err: any) {
          setErrorMessage('Error al subir nota de voz: ' + err.message);
        } finally {
          setIsUploading(false);
          setUploadStatus('');
          setIsRecording(false);
          setRecordingSeconds(0);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage('No se pudo acceder al micrófono: ' + err.message);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
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
        is_anonymous: isAnonymous,
        anonymous_name: isAnonymous ? (anonymousName.trim() || 'Anónimo') : undefined,
        anonymous_avatar: isAnonymous ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' : undefined,
        is_extalmita: Boolean(isExtalmita || postToExtalmita),
      });

      setContent('');
      setMediaList([]);
      setShowPoll(false);
      setPollOptions(['', '']);
      setIsAnonymous(false);
      setAnonymousName('Anónimo');
      setShowAnonymousNameInput(false);
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
      {isAnonymous ? (
        <div
          title="Modo Anónimo Activado"
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1c1f23] to-[#0d0f12] border-2 border-[#1d9bf0] flex items-center justify-center text-lg shadow-md shrink-0 select-none animate-pulse"
        >
          🎭
        </div>
      ) : (
        <img
          src={getSafeAvatarUrl(currentUser.avatar_url)}
          alt={currentUser.display_name}
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#2f3336]"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Extalmita Active Banner */}
        {postToExtalmita && (
          <div className="flex items-center justify-between bg-[#1d9bf0]/10 border border-[#1d9bf0]/40 px-3 py-1.5 rounded-xl mb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">🌐</span>
              <span className="text-[#1d9bf0] font-semibold">Publicando en Extalmita (Muro Comunitario Público)</span>
            </div>
            <button
              type="button"
              onClick={() => setPostToExtalmita(false)}
              className="text-[#71767b] hover:text-white cursor-pointer ml-2"
              title="Desactivar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Anonymous Mode Active Notification & Name Editor */}
        {isAnonymous && (
          <div className="flex items-center justify-between bg-[#1d9bf0]/10 border border-[#1d9bf0]/40 px-3 py-1.5 rounded-xl mb-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base select-none">🎭</span>
              <span className="text-[#1d9bf0] font-semibold">Modo Anónimo:</span>
              {showAnonymousNameInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    placeholder="Escribe el nombre anónimo"
                    maxLength={30}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setShowAnonymousNameInput(false);
                    }}
                    className="bg-black/90 border border-[#1d9bf0] text-white px-2 py-0.5 rounded text-xs outline-none w-36"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnonymousNameInput(false)}
                    className="bg-[#1d9bf0] text-white px-2 py-0.5 rounded text-[11px] font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAnonymousNameInput(true)}
                  className="text-white font-bold bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-colors"
                  title="Haz clic para modificar el nombre anónimo"
                >
                  {anonymousName || 'Anónimo'} ✏️
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className="text-[#71767b] hover:text-white cursor-pointer ml-2"
              title="Desactivar modo anónimo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Audience Selector pill */}
        {!compact && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1d9bf0] border border-[#2f3336] rounded-full px-3 py-1 w-fit mb-2 cursor-pointer hover:bg-[#1d9bf0]/10 transition-colors">
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
          className="w-full bg-transparent text-[#e7e9ea] text-[18px] sm:text-[19px] placeholder-[#71767b] outline-none resize-none leading-relaxed"
        />

        {/* Error notice */}
        {errorMessage && (
          <div className="text-red-400 text-sm mt-2 px-3 py-1.5 bg-red-950/40 rounded-xl border border-red-800 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Uploading progress indicator */}
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-[#1d9bf0] py-2 bg-[#1d9bf0]/10 px-3 rounded-xl mt-2 border border-[#1d9bf0]/20">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="font-medium truncate">{uploadStatus || 'Subiendo archivo...'}</span>
          </div>
        )}

        {/* Active Audio Recording Bar */}
        {isRecording && (
          <div className="mt-2 p-3 bg-red-950/40 border border-red-800 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping inline-block"></span>
              <span>Grabando nota de voz... 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
            </div>
            <button
              type="button"
              onClick={stopVoiceRecording}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Finalizar y Subir</span>
            </button>
          </div>
        )}

        {/* Media Preview */}
        {mediaList.length > 0 && (
          <MediaPreview media={mediaList} onRemove={handleRemoveMedia} isComposer />
        )}

        {/* GIF Picker Popover / Modal */}
        {showGifPicker && (
          <div className="mt-3 p-3 bg-[#16181c] border border-[#2f3336] rounded-2xl animate-pop-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#2f3336]">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-xs font-black border border-[#1d9bf0] text-[#1d9bf0] rounded px-1 py-0.5">GIF</span>
                Selecciona o sube un GIF
              </span>
              <button
                type="button"
                onClick={() => setShowGifPicker(false)}
                className="text-[#71767b] hover:text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => gifInputRef.current?.click()}
                className="w-full py-2 px-3 mb-3 bg-[#1d9bf0]/15 hover:bg-[#1d9bf0]/25 text-[#1d9bf0] border border-[#1d9bf0]/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir archivo .GIF desde tu dispositivo</span>
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {PRESET_GIFS.map((gif, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectPresetGif(gif)}
                    className="relative rounded-lg overflow-hidden group cursor-pointer border border-[#2f3336] hover:border-[#1d9bf0] transition-all aspect-video bg-black flex items-center justify-center"
                  >
                    <img src={gif.url} alt={gif.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[10px] text-white font-medium truncate text-center">
                      {gif.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                className="bg-black/60 border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-[#e7e9ea] focus:border-[#1d9bf0] outline-none"
              />
            ))}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="text-xs font-bold text-[#1d9bf0] hover:underline self-start mt-1"
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
            onChange={(e) => handleFileUpload(e, 'image')}
            accept="image/png,image/jpeg,image/webp,image/gif,image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={gifInputRef}
            onChange={(e) => handleFileUpload(e, 'gif')}
            accept="image/gif,.gif"
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => handleFileUpload(e, 'video')}
            accept="video/mp4,video/webm,video/quicktime,video/*,.mp4,.mov,.webm"
            className="hidden"
          />
          <input
            type="file"
            ref={audioInputRef}
            onChange={(e) => handleFileUpload(e, 'audio')}
            accept="audio/mp3,audio/wav,audio/ogg,audio/mpeg,audio/*,.mp3,.wav,.ogg,.m4a"
            className="hidden"
          />

          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar shrink min-w-0 pr-1">
            {/* Foto / Imagen */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10 rounded-full active:scale-95 transition-all cursor-pointer shrink-0"
              title="Foto / Imagen"
              aria-label="Foto / Imagen"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* GIF */}
            <button
              type="button"
              onClick={() => setShowGifPicker(!showGifPicker)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10 rounded-full active:scale-95 transition-all cursor-pointer shrink-0"
              title="Añadir GIF"
              aria-label="Añadir GIF"
            >
              <span className="text-[11px] font-black border border-current rounded px-1 py-0.2 leading-none">
                GIF
              </span>
            </button>

            {/* Video */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10 rounded-full active:scale-95 transition-all cursor-pointer shrink-0"
              title="Video (MP4, WEBM, MOV)"
              aria-label="Video"
            >
              <Film className="w-5 h-5" />
            </button>

            {/* Audio / Nota de voz */}
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10 rounded-full active:scale-95 transition-all cursor-pointer shrink-0"
              title="Subir archivo de audio (MP3, WAV, M4A)"
              aria-label="Audio"
            >
              <Music className="w-5 h-5" />
            </button>

            {/* Grabar voz en vivo */}
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer shrink-0 ${
                isRecording
                  ? 'text-red-500 bg-red-500/20'
                  : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10'
              }`}
              title="Grabar nota de voz con micrófono"
              aria-label="Grabar nota de voz"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Encuesta */}
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10 rounded-full active:scale-95 transition-all cursor-pointer shrink-0"
              title="Crear encuesta"
              aria-label="Crear encuesta"
            >
              <BarChart2 className="w-5 h-5" />
            </button>

            {/* Emoji */}
            <button
              type="button"
              onClick={() => setContent((prev) => prev + ' 🚀')}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10 rounded-full active:scale-95 transition-all cursor-pointer shrink-0"
              title="Añadir emoji"
              aria-label="Añadir emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Modo Anónimo Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !isAnonymous;
                setIsAnonymous(nextState);
                if (nextState) {
                  setShowAnonymousNameInput(true);
                }
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer shrink-0 ${
                isAnonymous
                  ? 'bg-[#1d9bf0]/20 text-[#1d9bf0] ring-1 ring-[#1d9bf0]'
                  : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10'
              }`}
              title={isAnonymous ? 'Modo Anónimo Activado (clic para desactivar)' : 'Activar Modo Anónimo 🎭'}
              aria-label="Modo Anónimo"
            >
              <span className="text-base select-none leading-none">🎭</span>
            </button>

            {/* Extalmita Muro Público Toggle */}
            <button
              type="button"
              onClick={() => setPostToExtalmita(!postToExtalmita)}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer shrink-0 ${
                postToExtalmita
                  ? 'bg-[#1d9bf0]/20 text-[#1d9bf0] ring-1 ring-[#1d9bf0]'
                  : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-white/10'
              }`}
              title={postToExtalmita ? 'Publicando en Extalmita (clic para desactivar)' : 'Publicar en Extalmita 🌐'}
              aria-label="Extalmita"
            >
              <span className="text-base select-none leading-none">🌐</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <span
                className={`text-xs ${
                  isOverLimit
                    ? 'text-red-500 font-bold'
                    : charsLeft <= 50
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
                  ? 'bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white active:scale-95 shadow-sm cursor-pointer'
                  : 'bg-[#1d9bf0]/40 text-white/60 cursor-not-allowed'
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
