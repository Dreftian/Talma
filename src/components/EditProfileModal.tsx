import React, { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfile, uploadMedia } from '../lib/api';

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSaved: (updated: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  onClose,
  onSaved,
}) => {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const uploaded = await uploadMedia(file);
      setAvatarUrl(uploaded.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const uploaded = await uploadMedia(file);
      setBannerUrl(uploaded.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(profile.id, {
        display_name: displayName,
        bio,
        location,
        website,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });
      onSaved(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-black border-0 sm:border border-[#2f3336] rounded-none sm:rounded-2xl w-full sm:max-w-xl overflow-hidden shadow-2xl animate-pop-in flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2f3336] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onClose}
              className="p-1.5 text-white hover:bg-[#181818] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-extrabold text-xl text-white">Editar perfil</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-white hover:bg-white/90 text-black font-extrabold px-5 py-1.5 rounded-full text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 pb-6">
          {/* Banner with camera overlay */}
          <div className="relative h-44 bg-[#2f3336] flex items-center justify-center">
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-950 to-black" />
            )}
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-colors"
            >
              {uploadingBanner ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
          </div>

          {/* Avatar with camera overlay */}
          <div className="px-4 relative -mt-14 mb-4 flex">
            <div className="relative w-28 h-28 rounded-full border-4 border-black overflow-hidden bg-[#16181c] flex items-center justify-center">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              >
                {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="px-4 flex flex-col gap-4">
            <div className="border border-[#2f3336] rounded-lg p-2 focus-within:border-[#1d9bf0] transition-colors">
              <label className="text-xs text-[#71767b] block font-medium">Nombre</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-base mt-0.5"
              />
            </div>

            <div className="border border-[#2f3336] rounded-lg p-2 focus-within:border-[#1d9bf0] transition-colors">
              <label className="text-xs text-[#71767b] block font-medium">Biografía</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={160}
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-base mt-0.5 resize-none"
              />
            </div>

            <div className="border border-[#2f3336] rounded-lg p-2 focus-within:border-[#1d9bf0] transition-colors">
              <label className="text-xs text-[#71767b] block font-medium">Ubicación</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={30}
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-base mt-0.5"
              />
            </div>

            <div className="border border-[#2f3336] rounded-lg p-2 focus-within:border-[#1d9bf0] transition-colors">
              <label className="text-xs text-[#71767b] block font-medium">Sitio web</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                maxLength={100}
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-base mt-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
