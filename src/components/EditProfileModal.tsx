import React, { useState, useRef } from 'react';
import { ArrowLeft, X, Camera, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfile, uploadMedia } from '../lib/api';
import { getSafeAvatarUrl } from '../lib/avatar';

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
  // Campo local: UserProfile no incluye fecha de nacimiento, así que se mantiene
  // solo en el estado del formulario para no romper el guardado.
  const [birthDate, setBirthDate] = useState('marzo 23, 1998');
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 select-none">
      <div className="bg-black border-0 sm:border border-[#2f3336] rounded-none sm:rounded-2xl w-full sm:max-w-xl overflow-hidden shadow-2xl animate-pop-in flex flex-col h-full sm:h-auto sm:max-h-[92vh]">
        {/* Header matching 8.jpeg */}
        <div className="px-4 py-3 border-b border-[#2f3336] flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-6">
            <button
              onClick={onClose}
              className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 sm:hidden" />
              <X className="w-5 h-5 hidden sm:block" />
            </button>
            <h2 className="font-extrabold text-xl text-white">Editar perfil</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-4 py-1.5 rounded-full text-[15px] transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 pb-8">
          {/* Banner with camera overlay */}
          <div className="relative h-44 bg-[#2f3336] flex items-center justify-center">
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-950 via-black to-[#16181c]" />
            )}
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerChange}
              accept="image/*"
              className="hidden"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-colors cursor-pointer"
              >
                {uploadingBanner ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </button>
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Avatar with camera overlay */}
          <div className="px-4 relative -mt-14 mb-4 flex">
            <div className="relative w-28 h-28 rounded-full border-4 border-black overflow-hidden bg-[#16181c] flex items-center justify-center">
              <img
                src={getSafeAvatarUrl(avatarUrl)}
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
                className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Fields with character count labels matching 8.jpeg */}
          <div className="px-4 flex flex-col gap-4">
            {/* Nombre */}
            <div className="border-b border-[#2f3336] pb-2 focus-within:border-b-[#1d9bf0] transition-colors">
              <div className="flex items-center justify-between text-[13px] text-[#71767b]">
                <label htmlFor="edit-display-name">Nombre</label>
                <span>{displayName.length} / 50</span>
              </div>
              <input
                id="edit-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-[17px] mt-1 placeholder-[#71767b]"
              />
            </div>

            {/* Biografía */}
            <div className="border-b border-[#2f3336] pb-2 focus-within:border-b-[#1d9bf0] transition-colors">
              <div className="flex items-center justify-between text-[13px] text-[#71767b]">
                <label htmlFor="edit-bio">Biografía</label>
                <span>{bio.length} / 160</span>
              </div>
              <textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={160}
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-[17px] mt-1 resize-none"
              />
            </div>

            {/* Ubicación */}
            <div className="border-b border-[#2f3336] pb-2 focus-within:border-b-[#1d9bf0] transition-colors">
              <div className="flex items-center justify-between text-[13px] text-[#71767b]">
                <label htmlFor="edit-location">Ubicación</label>
                <span>{location.length} / 30</span>
              </div>
              <input
                id="edit-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={30}
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-[17px] mt-1 placeholder-[#71767b]"
              />
            </div>

            {/* Sitio web */}
            <div className="border-b border-[#2f3336] pb-2 focus-within:border-b-[#1d9bf0] transition-colors">
              <div className="flex items-center justify-between text-[13px] text-[#71767b]">
                <label htmlFor="edit-website">Sitio web</label>
                <span>{website.length} / 100</span>
              </div>
              <input
                id="edit-website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                maxLength={100}
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-[17px] mt-1 placeholder-[#71767b]"
              />
            </div>

            {/* Fecha de nacimiento (ref "Editar perfil") */}
            <div className="border-b border-[#2f3336] pb-2 focus-within:border-b-[#1d9bf0] transition-colors">
              <div className="flex items-center justify-between text-[13px] text-[#71767b]">
                <label htmlFor="edit-birth-date">Fecha de nacimiento</label>
                <button
                  type="button"
                  onClick={() => document.getElementById('edit-birth-date')?.focus()}
                  className="text-[#1d9bf0] font-semibold hover:underline cursor-pointer"
                >
                  Editar
                </button>
              </div>
              <input
                id="edit-birth-date"
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="Mes día, año"
                className="w-full bg-transparent text-[#e7e9ea] outline-none text-[17px] mt-1 placeholder-[#71767b]"
              />
              <p className="text-[13px] text-[#71767b] mt-1 leading-snug">
                Mes y día: Tus seguidores / Año: Solo tú
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
