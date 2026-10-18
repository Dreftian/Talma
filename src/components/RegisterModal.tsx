import React, { useState, useRef } from 'react';
import { X, Loader2, Camera, Eye, EyeOff } from 'lucide-react';
import { TalmaLogo } from './TalmaLogo';
import { UserProfile } from '../types';
import { uploadMedia } from '../lib/api';

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadMedia(file);
      setAvatarUrl(uploaded.url);
    } catch (err: any) {
      setError('Error al subir foto de perfil: ' + (err.message || ''));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanUsername = username.trim().replace(/^@/, '');
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: cleanUsername,
          email: email.trim() || `${cleanUsername}@talma.app`,
          password,
          avatar_url: avatarUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#242d34]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-[#2f3336] rounded-2xl w-full max-w-[500px] p-6 sm:p-8 overflow-hidden shadow-2xl animate-pop-in relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-white hover:bg-[#181818] rounded-full transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Logo */}
        <div className="flex justify-center mb-4">
          <TalmaLogo size="lg" variant="icon" />
        </div>

        {/* Title */}
        <div className="text-left mb-5">
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Crea tu cuenta
          </h2>
          <p className="text-sm text-[#71767b] mt-1">
            Únete a Talma hoy mismo. Es 100% gratis.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-xl text-left leading-snug">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 overflow-y-auto pr-1">
          {/* Avatar selector */}
          <div className="flex items-center gap-4 py-2">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#16181c] border-2 border-[#2f3336] flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-xl font-bold text-[#71767b]">
                  {name ? name[0].toUpperCase() : 'T'}
                </div>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-[#22c55e] animate-spin" />
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#16181c] hover:bg-[#202327] border border-[#2f3336] hover:border-[#22c55e] text-[#e7e9ea] rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>{avatarUrl ? 'Cambiar foto' : 'Subir foto a Supabase'}</span>
              </button>
              <p className="text-[11px] text-[#71767b] mt-1">Opcional: puedes añadirla luego</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#22c55e] transition-colors bg-black">
            <label className="text-[11px] text-[#71767b] block font-medium">
              Nombre y Apellidos
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Dreftian"
              className="w-full bg-transparent text-white outline-none text-base mt-0.5"
            />
          </div>

          {/* Username */}
          <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#22c55e] transition-colors bg-black">
            <label className="text-[11px] text-[#71767b] block font-medium">
              Nombre de usuario (@)
            </label>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[#71767b] text-base select-none">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="dreftian"
                className="w-full bg-transparent text-white outline-none text-base"
              />
            </div>
          </div>

          {/* Email */}
          <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#22c55e] transition-colors bg-black">
            <label className="text-[11px] text-[#71767b] block font-medium">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-transparent text-white outline-none text-base mt-0.5"
            />
          </div>

          {/* Password */}
          <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#22c55e] transition-colors bg-black relative">
            <label className="text-[11px] text-[#71767b] block font-medium">
              Contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-white outline-none text-base mt-0.5 pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71767b] hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || isUploadingAvatar}
            className="w-full mt-4 bg-white hover:bg-[#e6e6e6] text-black font-extrabold py-3.5 rounded-full text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin text-black" />}
            <span>Crear cuenta</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#2f3336] text-center">
          <p className="text-sm text-[#71767b]">
            ¿Ya tienes una cuenta?{' '}
            <span
              onClick={onSwitchToLogin}
              className="text-[#22c55e] hover:underline cursor-pointer font-bold"
            >
              Iniciar sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
