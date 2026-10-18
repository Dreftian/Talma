import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Maximize2 } from 'lucide-react';
import { MediaAttachment } from '../types';
import { formatDuration } from '../lib/utils';

interface MediaPreviewProps {
  media: MediaAttachment[];
  onRemove?: (index: number) => void;
  isComposer?: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  media,
  onRemove,
  isComposer = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!media || media.length === 0) return null;

  return (
    <>
      <div className="mt-3 w-full rounded-2xl overflow-hidden border border-[#2f3336]">
        {media.map((item, index) => {
          if (item.type === 'video') {
            return (
              <div
                key={index}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full bg-black aspect-video flex items-center justify-center"
              >
                <video
                  src={item.url}
                  controls
                  className="w-full h-full object-contain"
                  playsInline
                />
                {isComposer && onRemove && (
                  <button
                    onClick={() => onRemove(index)}
                    className="absolute top-3 right-3 bg-black/75 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          }

          if (item.type === 'audio') {
            return (
              <div key={index} onClick={(e) => e.stopPropagation()}>
                <AudioPlayerItem
                  item={item}
                  isComposer={isComposer}
                  onRemove={onRemove ? () => onRemove(index) : undefined}
                />
              </div>
            );
          }

          return null;
        })}

        {/* Images Grid */}
        <ImagesGrid
          images={media.filter((m) => m.type === 'image' || m.type === 'gif')}
          onImageClick={(url) => setSelectedImage(url)}
          isComposer={isComposer}
          onRemove={onRemove}
        />
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 left-4 p-2 text-white bg-black/60 hover:bg-black/80 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Detalle"
            className="max-w-full max-h-[90vh] object-contain rounded-lg animate-pop-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

const ImagesGrid: React.FC<{
  images: MediaAttachment[];
  onImageClick: (url: string) => void;
  isComposer?: boolean;
  onRemove?: (index: number) => void;
}> = ({ images, onImageClick, isComposer, onRemove }) => {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative group w-full max-h-[510px] overflow-hidden bg-[#16181c]">
        <img
          src={images[0].url}
          alt="Post media"
          onClick={() => !isComposer && onImageClick(images[0].url)}
          className={`w-full max-h-[510px] object-cover ${!isComposer ? 'cursor-pointer hover:opacity-95' : ''}`}
        />
        {isComposer && onRemove && (
          <button
            onClick={() => onRemove(0)}
            className="absolute top-3 right-3 bg-black/75 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 max-h-[350px] bg-[#2f3336]">
        {images.map((img, i) => (
          <div key={i} className="relative h-[300px] overflow-hidden bg-[#16181c]">
            <img
              src={img.url}
              alt=""
              onClick={() => !isComposer && onImageClick(img.url)}
              className={`w-full h-full object-cover ${!isComposer ? 'cursor-pointer hover:opacity-95' : ''}`}
            />
            {isComposer && onRemove && (
              <button
                onClick={() => onRemove(i)}
                className="absolute top-2 right-2 bg-black/75 text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5 max-h-[350px] bg-[#2f3336]">
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className="relative h-[175px] overflow-hidden bg-[#16181c]">
          <img
            src={img.url}
            alt=""
            onClick={() => !isComposer && onImageClick(img.url)}
            className={`w-full h-full object-cover ${!isComposer ? 'cursor-pointer hover:opacity-95' : ''}`}
          />
          {isComposer && onRemove && (
            <button
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 bg-black/75 text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const AudioPlayerItem: React.FC<{
  item: MediaAttachment;
  isComposer?: boolean;
  onRemove?: () => void;
}> = ({ item, isComposer, onRemove }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <div className="relative bg-[#16181c] p-4 flex flex-col gap-2.5 select-none border-b border-[#2f3336]/40 last:border-b-0">
      <audio
        ref={audioRef}
        src={item.url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#71767b]">
            <span className="font-medium text-[#e7e9ea] truncate">
              {item.name || 'Nota de audio en Talma'}
            </span>
            <span>
              {formatDuration(currentTime)} / {formatDuration(duration || 0)}
            </span>
          </div>

          {/* Audio seek scrubber bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[#2f3336] rounded-lg appearance-none cursor-pointer accent-[#1d9bf0]"
          />
        </div>

        {isComposer && onRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 text-[#71767b] hover:text-white hover:bg-black/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Waveform graphic visualization */}
      <div className="flex items-center gap-0.5 h-4 px-1 opacity-75">
        {[20, 45, 80, 60, 30, 90, 75, 40, 65, 100, 85, 30, 50, 70, 95, 60, 40, 80, 55, 35, 70, 90, 45, 60].map(
          (h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-[#1d9bf0] animate-pulse' : 'bg-[#71767b]/50'
              }`}
              style={{
                height: `${h}%`,
                animationDelay: `${i * 40}ms`,
              }}
            />
          )
        )}
      </div>
    </div>
  );
};
