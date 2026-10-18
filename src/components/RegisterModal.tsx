import React, { useState, useRef } from 'react';
import { X, Loader2, Camera, Eye, EyeOff, Upload, CheckCircle2 } from 'lucide-react';
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<string>('');
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
    setError(null);
    try {
      const uploaded = await uploadMedia(file);
      setAvatarUrl(uploaded.url);
    } catch (err: any) {
      setError('Error al subir la foto de perfil a Supabase: ' + (err.message || ''));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory fields validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('El nombre y apellido son obligatorios');
      return;
    }

    if (!age || Number(age) < 13 || Number(age) > 120) {
      setError('Ingresa una edad válida (mínimo 13 años)');
      return;
    }

    if (!avatarUrl) {
      setError('La foto de perfil es obligatoria. Por favor sube una foto.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo electrónico (Gmail) válido');
      return;
    }

    if (!username.trim()) {
      setError('El nombre de usuario es obligatorio');
      return;
    }

    if (!password || password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          display_name: `${firstName.trim()} ${lastName.trim()}`,
          age: Number(age),
          username: cleanUsername,
          email: email.trim().toLowerCase(),
          password,
          avatar_url: avatarUrl,
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
    <div className="fixed inset-0 bg-[#242d34]/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-black border border-[#2f3336] rounded-2xl w-full max-w-[520px] p-5 sm:p-7 overflow-hidden shadow-2xl animate-pop-in relative max-h-[94vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-white hover:bg-[#181818] rounded-full transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Logo */}
        <div className="flex justify-center mb-3">
          <TalmaLogo size="md" variant="icon" />
        </div>

        {/* Title */}
        <div className="text-left mb-4">
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Crea tu cuenta
          </h2>
          <p className="text-xs sm:text-sm text-[#71767b] mt-1">
            Completa tus datos obligatorios para formar parte de Talma.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs sm:text-sm rounded-xl text-left leading-snug">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Avatar selector (OBLIGATORIO) */}
          <div className="flex items-center gap-4 py-2 px-3 bg-[#16181c] rounded-xl border border-[#2f3336]">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black border-2 border-[#1d9bf0] flex items-center justify-center shrink-0 shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera className="w-6 h-6 text-[#1d9bf0] mx-auto opacity-80" />
                </div>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-[#1d9bf0] animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1">
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
                disabled={isUploadingAvatar}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  avatarUrl
                    ? 'bg-[#1d9bf0]/15 text-[#1d9bf0] border-[#1d9bf0]/50 hover:bg-[#1d9bf0]/25'
                    : 'bg-[#1d9bf0] text-white border-[#1d9bf0] hover:bg-[#1a8cd8]'
                }`}
              >
                {avatarUrl ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cambiar foto</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir foto (Obligatorio) *</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#71767b] mt-1">
                {avatarUrl ? 'Foto de perfil lista' : 'Obligatorio: Sube tu foto de perfil'}
              </p>
            </div>
          </div>

          {/* Nombre y Apellido (Obligatorios) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#1d9bf0] transition-colors bg-black">
              <label className="text-[11px] text-[#71767b] block font-medium">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej: Daniel"
                className="w-full bg-transparent text-white outline-none text-sm sm:text-base mt-0.5"
              />
            </div>

            <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#1d9bf0] transition-colors bg-black">
              <label className="text-[11px] text-[#71767b] block font-medium">
                Apellido *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej: Reitz"
                className="w-full bg-transparent text-white outline-none text-sm sm:text-base mt-0.5"
              />
            </div>
          </div>

          {/* Edad y Nombre de usuario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#1d9bf0] transition-colors bg-black">
              <label className="text-[11px] text-[#71767b] block font-medium">
                Edad *
              </label>
              <input
                type="number"
                required
                min={13}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ej: 24"
                className="w-full bg-transparent text-white outline-none text-sm sm:text-base mt-0.5"
              />
            </div>

            <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#1d9bf0] transition-colors bg-black">
              <label className="text-[11px] text-[#71767b] block font-medium">
                Nombre de usuario (@) *
              </label>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[#71767b] text-sm select-none">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="usuario"
                  className="w-full bg-transparent text-white outline-none text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Gmail / Correo electrónico (Obligatorio) */}
          <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#1d9bf0] transition-colors bg-black">
            <label className="text-[11px] text-[#71767b] block font-medium">
              Gmail / Correo electrónico *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.cuenta@gmail.com"
              className="w-full bg-transparent text-white outline-none text-sm sm:text-base mt-0.5"
            />
          </div>

          {/* Contraseña (Obligatorio) */}
          <div className="border border-[#333639] rounded-md px-3 pt-2 pb-1.5 focus-within:border-[#1d9bf0] transition-colors bg-black relative">
            <label className="text-[11px] text-[#71767b] block font-medium">
              Contraseña *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea tu contraseña segura"
              className="w-full bg-transparent text-white outline-none text-sm sm:text-base mt-0.5 pr-8"
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
            className="w-full mt-3 bg-white hover:bg-[#e6e6e6] text-black font-extrabold py-3.5 rounded-full text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin text-black" />}
            <span>Registrarse en Talma</span>
          </button>
        </form>

        <div className="mt-3 pt-3 border-t border-[#2f3336] text-center">
          <p className="text-sm text-[#71767b]">
            ¿Ya tienes una cuenta?{' '}
            <span
              onClick={onSwitchToLogin}
              className="text-[#1d9bf0] hover:underline cursor-pointer font-bold"
            >
              Iniciar sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
