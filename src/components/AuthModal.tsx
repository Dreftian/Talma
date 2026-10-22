import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Eye, EyeOff, Phone, Trash2, Plus, User } from 'lucide-react';
import { TalmaLogo } from './TalmaLogo';
import { UserProfile } from '../types';
import { socialLogin, phoneLogin } from '../lib/api';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onSwitchToRegister?: () => void;
}

type AuthStep = 'identifier' | 'password' | 'phone' | 'phone_otp' | 'google' | 'apple';

interface BrowserSocialAccount {
  email: string;
  name: string;
  avatar_url?: string;
}

const COUNTRY_CODES = [
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+1', country: 'EE. UU. / Canadá', flag: '🇺🇸' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess, onSwitchToRegister }) => {
  const [step, setStep] = useState<AuthStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone Login State - Clean by default, detects saved phone in this specific browser if any
  const [selectedCountry, setSelectedCountry] = useState('+51');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState('');

  // Google Browser Accounts - Only accounts that THIS person has saved on THIS browser
  const [savedGoogleAccounts, setSavedGoogleAccounts] = useState<BrowserSocialAccount[]>([]);
  const [googleMode, setGoogleMode] = useState<'picker' | 'input'>('input');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Apple Browser Accounts - Only accounts that THIS person has saved on THIS browser
  const [savedAppleAccounts, setSavedAppleAccounts] = useState<BrowserSocialAccount[]>([]);
  const [appleMode, setAppleMode] = useState<'picker' | 'input'>('input');
  const [appleEmail, setAppleEmail] = useState('');
  const [appleName, setAppleName] = useState('');
  const [appleOption, setAppleOption] = useState<'share' | 'hide'>('share');

  // Load browser-specific accounts on mount
  useEffect(() => {
    try {
      const gAccounts = localStorage.getItem('talma_browser_google_accounts');
      if (gAccounts) {
        const parsed = JSON.parse(gAccounts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedGoogleAccounts(parsed);
          setGoogleMode('picker');
        }
      }

      const aAccounts = localStorage.getItem('talma_browser_apple_accounts');
      if (aAccounts) {
        const parsed = JSON.parse(aAccounts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAppleAccounts(parsed);
          setAppleMode('picker');
        }
      }

      const savedPhone = localStorage.getItem('talma_browser_phone');
      if (savedPhone) {
        const parsed = JSON.parse(savedPhone);
        if (parsed.phone) {
          setPhoneNumber(parsed.phone);
          if (parsed.country) setSelectedCountry(parsed.country);
        }
      }
    } catch {
      // Clean fallback
    }
  }, []);

  const saveGoogleAccountToBrowser = (acc: BrowserSocialAccount) => {
    try {
      const filtered = savedGoogleAccounts.filter(
        (a) => a.email.toLowerCase() !== acc.email.toLowerCase()
      );
      const updated = [acc, ...filtered].slice(0, 5);
      setSavedGoogleAccounts(updated);
      localStorage.setItem('talma_browser_google_accounts', JSON.stringify(updated));
    } catch {}
  };

  const removeGoogleAccountFromBrowser = (email: string) => {
    try {
      const updated = savedGoogleAccounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
      setSavedGoogleAccounts(updated);
      localStorage.setItem('talma_browser_google_accounts', JSON.stringify(updated));
      if (updated.length === 0) {
        setGoogleMode('input');
      }
    } catch {}
  };

  const saveAppleAccountToBrowser = (acc: BrowserSocialAccount) => {
    try {
      const filtered = savedAppleAccounts.filter(
        (a) => a.email.toLowerCase() !== acc.email.toLowerCase()
      );
      const updated = [acc, ...filtered].slice(0, 5);
      setSavedAppleAccounts(updated);
      localStorage.setItem('talma_browser_apple_accounts', JSON.stringify(updated));
    } catch {}
  };

  const removeAppleAccountFromBrowser = (email: string) => {
    try {
      const updated = savedAppleAccounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
      setSavedAppleAccounts(updated);
      localStorage.setItem('talma_browser_apple_accounts', JSON.stringify(updated));
      if (updated.length === 0) {
        setAppleMode('input');
      }
    } catch {}
  };

  // Handle standard password step submission
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setError(null);
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Ingresa tu contraseña');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier.trim(),
          id: identifier.trim(),
          username: identifier.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No encontramos tu cuenta o la contraseña es incorrecta.');
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone Send OTP
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phoneNumber.trim().replace(/[^0-9]/g, '');
    if (cleanDigits.length < 6) {
      setError('Ingresa un número de teléfono válido (mínimo 6 dígitos)');
      return;
    }
    setError(null);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoCode(code);
    setStep('phone_otp');
  };

  // Handle Phone Verify OTP & Login
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos enviado por SMS');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullPhone = selectedCountry + ' ' + phoneNumber.trim();
      const data = await phoneLogin({
        phone: fullPhone,
        code: otpCode,
        name: 'Usuario (' + phoneNumber.trim().slice(-4) + ')',
      });

      // Save phone preference to this browser
      try {
        localStorage.setItem(
          'talma_browser_phone',
          JSON.stringify({ phone: phoneNumber.trim(), country: selectedCountry })
        );
      } catch {}

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al verificar el teléfono');
    } finally {
      setLoading(false);
    }
  };

  // Handle Social Login (Google / Apple)
  const handlePerformSocial = async (
    provider: 'google' | 'apple',
    email: string,
    name?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const displayName = name?.trim() || cleanEmail.split('@')[0];
      const data = await socialLogin({
        provider,
        email: cleanEmail,
        name: displayName,
      });

      // Remember in THIS user's browser only
      if (provider === 'google') {
        saveGoogleAccountToBrowser({
          email: cleanEmail,
          name: displayName,
        });
      } else {
        saveAppleAccountToBrowser({
          email: cleanEmail,
          name: displayName,
        });
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con ' + provider);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#242d34]/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-black border border-[#2f3336] rounded-2xl w-full max-w-[440px] p-6 sm:p-8 overflow-hidden shadow-2xl animate-pop-in relative">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              if (step !== 'identifier') {
                setStep('identifier');
                setError(null);
              } else {
                onClose();
              }
            }}
            className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2.5">
            <TalmaLogo size="sm" variant="icon" />
            <h2 className="font-extrabold text-[19px] sm:text-[21px] text-white tracking-tight leading-tight">
              {step === 'identifier' && 'Descubre qué está pasando'}
              {step === 'password' && 'Introduce tu contraseña'}
              {step === 'phone' && 'Iniciar sesión con teléfono'}
              {step === 'phone_otp' && 'Verificar número telefónico'}
              {step === 'google' && 'Acceder con Google'}
              {step === 'apple' && 'Iniciar sesión con Apple ID'}
            </h2>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs sm:text-sm rounded-xl text-left leading-snug">
            {error}
          </div>
        )}

        {/* PASO 1: IDENTIFICADOR PRINCIPAL (RAÍZ) */}
        {step === 'identifier' && (
          <>
            <div className="flex flex-col gap-3">
              {/* Continuar con el teléfono */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep('phone');
                }}
                disabled={loading}
                className="w-full bg-white hover:bg-[#e6e6e6] text-black font-bold py-2.5 px-4 rounded-full text-[14px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 select-none shadow-sm"
              >
                <Phone className="w-4 h-4 text-black fill-current" />
                <span>Continuar con el teléfono</span>
              </button>

              {/* Continuar con Google */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep('google');
                }}
                disabled={loading}
                className="w-full bg-white hover:bg-[#e6e6e6] text-black font-bold py-2.5 px-4 rounded-full text-[14px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 select-none shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              {/* Continuar con Apple */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep('apple');
                }}
                disabled={loading}
                className="w-full bg-white hover:bg-[#e6e6e6] text-black font-bold py-2.5 px-4 rounded-full text-[14px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 select-none shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.66-7.85-11.92-14.43-6.28-9.67-11.22-20.73-14.8-33.18-3.58-12.45-5.37-24.3-5.37-35.56 0-16.74 4.54-30.43 13.62-41.07 9.08-10.64 20.35-16.12 33.8-16.44 4.8 0 10.23 1.25 16.3 3.75 6.07 2.5 10.36 3.86 12.87 4.09 2.05-.23 6.35-1.57 12.89-4.04 6.54-2.47 11.77-3.64 15.69-3.53 11.45.65 20.89 4.67 28.32 12.06 7.43 7.39 12.24 16.44 14.42 27.15-10.45 6.31-15.61 14.99-15.48 26.04.13 8.71 3.51 16.27 10.14 22.68 6.63 6.41 14.38 10.12 23.25 11.13-2.18 6.53-4.9 12.84-8.16 18.93zM119.22 31.84c0-7.72 2.76-14.97 8.28-21.75 5.53-6.77 12.43-10.66 20.71-11.66.22 1.3.33 2.45.33 3.44 0 7.82-2.94 15.22-8.81 22.21-5.88 6.98-13.06 10.99-21.56 12.02-.33-1.41-.5-2.73-.5-4.26z" />
                </svg>
                <span>Continuar con Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-[#2f3336]"></div>
              <span className="px-3 text-xs text-[#71767b]">o</span>
              <div className="flex-1 h-px bg-[#2f3336]"></div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleNextStep} className="flex flex-col gap-4">
              <div className="border border-[#2f3336] focus-within:border-[#1d9bf0] rounded-md px-3.5 py-3 transition-colors bg-black">
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Correo electrónico o nombre de usuario"
                  className="w-full bg-transparent text-white outline-none text-[15px] placeholder-[#71767b]"
                />
              </div>

              {/* Continuar button */}
              <button
                type="submit"
                disabled={!identifier.trim() || loading}
                className={
                  'w-full font-bold py-3 rounded-full text-[15px] transition-all flex items-center justify-center gap-2 ' +
                  (!identifier.trim() || loading
                    ? 'bg-[#333639] text-[#71767b] cursor-not-allowed'
                    : 'bg-white hover:bg-[#e6e6e6] text-black cursor-pointer active:scale-[0.98]')
                }
              >
                <span>Continuar</span>
              </button>
            </form>
          </>
        )}

        {/* PASO 2: CONTRASEÑA DIRECTA */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 animate-fade-in">
            <div className="border border-[#2f3336] rounded-md px-3.5 py-2.5 bg-[#16181c]/50 text-xs text-[#71767b]">
              <span>Ingresando como: </span>
              <span className="text-white font-bold">{identifier}</span>
            </div>

            <div className="border border-[#2f3336] focus-within:border-[#1d9bf0] rounded-md px-3.5 py-3 transition-colors bg-black relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
                className="w-full bg-transparent text-white outline-none text-[15px] pr-9 placeholder-[#71767b]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71767b] hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!password || loading}
              className={
                'w-full font-bold py-3 rounded-full text-[15px] transition-all flex items-center justify-center gap-2 ' +
                (!password || loading
                  ? 'bg-[#333639] text-[#71767b] cursor-not-allowed'
                  : 'bg-white hover:bg-[#e6e6e6] text-black cursor-pointer active:scale-[0.98]')
              }
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
              <span>Iniciar sesión</span>
            </button>
          </form>
        )}

        {/* PASO 3: TELÉFONO - INGRESO LIMPIO DE NÚMERO */}
        {step === 'phone' && (
          <form onSubmit={handleSendPhoneOtp} className="flex flex-col gap-4 animate-fade-in">
            <p className="text-xs text-[#71767b]">
              Ingresa tu número de teléfono móvil para recibir un código de verificación SMS en tu dispositivo.
            </p>

            <div className="flex gap-2">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-1/3 bg-black border border-[#2f3336] focus:border-[#1d9bf0] rounded-md px-2.5 py-3 text-xs text-white outline-none cursor-pointer"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#16181c] text-white">
                    {c.flag} {c.code} ({c.country})
                  </option>
                ))}
              </select>

              <div className="w-2/3 border border-[#2f3336] focus-within:border-[#1d9bf0] rounded-md px-3.5 py-3 transition-colors bg-black">
                <input
                  type="tel"
                  required
                  autoFocus
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Número de teléfono"
                  className="w-full bg-transparent text-white outline-none text-[15px] placeholder-[#71767b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!phoneNumber.trim() || loading}
              className={
                'w-full font-bold py-3 rounded-full text-[15px] transition-all flex items-center justify-center gap-2 ' +
                (!phoneNumber.trim() || loading
                  ? 'bg-[#333639] text-[#71767b] cursor-not-allowed'
                  : 'bg-white hover:bg-[#e6e6e6] text-black cursor-pointer active:scale-[0.98]')
              }
            >
              <span>Enviar código por SMS</span>
            </button>
          </form>
        )}

        {/* PASO 4: TELÉFONO - VERIFICACIÓN OTP */}
        {step === 'phone_otp' && (
          <form onSubmit={handleVerifyPhoneOtp} className="flex flex-col gap-4 animate-fade-in">
            <p className="text-xs text-[#71767b]">
              Enviamos un código de verificación al <span className="text-white font-bold">{selectedCountry} {phoneNumber}</span>.
            </p>

            {/* Simulación en tiempo real del código SMS para facilitar la prueba */}
            <div className="p-3 bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 rounded-xl text-xs text-[#1d9bf0] flex items-center justify-between">
              <span>Código SMS recibido: <strong className="text-white text-sm tracking-widest">{demoCode}</strong></span>
              <button
                type="button"
                onClick={() => setOtpCode(demoCode)}
                className="underline hover:text-white cursor-pointer font-bold ml-2"
              >
                Copiar
              </button>
            </div>

            <div className="border border-[#2f3336] focus-within:border-[#1d9bf0] rounded-md px-3.5 py-3 transition-colors bg-black">
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Código de 6 dígitos"
                className="w-full bg-transparent text-white outline-none text-center font-mono tracking-widest text-lg placeholder-[#71767b]"
              />
            </div>

            <button
              type="submit"
              disabled={otpCode.length !== 6 || loading}
              className={
                'w-full font-bold py-3 rounded-full text-[15px] transition-all flex items-center justify-center gap-2 ' +
                (otpCode.length !== 6 || loading
                  ? 'bg-[#333639] text-[#71767b] cursor-not-allowed'
                  : 'bg-white hover:bg-[#e6e6e6] text-black cursor-pointer active:scale-[0.98]')
              }
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
              <span>Verificar e iniciar sesión</span>
            </button>
          </form>
        )}

        {/* PASO 5: GOOGLE - LIMPIO Y BASADO EN CUENTAS DE ESTE NAVEGADOR */}
        {step === 'google' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {googleMode === 'picker' && savedGoogleAccounts.length > 0 ? (
              <>
                <p className="text-xs text-[#71767b]">
                  Elige una cuenta de Google guardada en este navegador:
                </p>

                <div className="flex flex-col divide-y divide-[#2f3336]/60 border border-[#2f3336] rounded-xl overflow-hidden">
                  {savedGoogleAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group"
                    >
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handlePerformSocial('google', acc.email, acc.name)}
                        className="flex items-center gap-3.5 text-left flex-1 min-w-0 cursor-pointer disabled:opacity-50"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#1d9bf0]/20 text-[#1d9bf0] font-black text-sm flex items-center justify-center shrink-0 border border-[#1d9bf0]/40">
                          {acc.name ? acc.name.charAt(0).toUpperCase() : acc.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold text-white text-sm truncate">{acc.name || acc.email}</span>
                          <span className="text-xs text-[#71767b] truncate">{acc.email}</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGoogleAccountFromBrowser(acc.email);
                        }}
                        title="Quitar de este navegador"
                        className="p-1.5 text-[#71767b] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors ml-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setGoogleMode('input')}
                    className="p-3.5 text-xs text-[#1d9bf0] hover:bg-white/5 font-bold transition-colors text-center w-full cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Usar otra cuenta de Google</span>
                  </button>
                </div>
              </>
            ) : (
              /* Modo limpio directo para ingresar cuenta de Google */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePerformSocial('google', googleEmail, googleName);
                }}
                className="flex flex-col gap-3.5"
              >
                <p className="text-xs text-[#71767b]">
                  Ingresa tu cuenta de Google para iniciar sesión en Talma:
                </p>

                <div className="border border-[#2f3336] focus-within:border-[#1d9bf0] rounded-md px-3.5 py-3 transition-colors bg-black">
                  <input
                    type="email"
                    required
                    autoFocus
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="Correo de Google (ej. tu_cuenta@gmail.com)"
                    className="w-full bg-transparent text-white outline-none text-[15px] placeholder-[#71767b]"
                  />
                </div>

                <div className="border border-[#2f3336] focus-within:border-[#1d9bf0] rounded-md px-3.5 py-3 transition-colors bg-black">
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Nombre completo (opcional)"
                    className="w-full bg-transparent text-white outline-none text-[15px] placeholder-[#71767b]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!googleEmail.trim() || loading}
                  className={
                    'w-full font-bold py-3 rounded-full text-[15px] transition-all flex items-center justify-center gap-2 ' +
                    (!googleEmail.trim() || loading
                      ? 'bg-[#333639] text-[#71767b] cursor-not-allowed'
                      : 'bg-white hover:bg-[#e6e6e6] text-black cursor-pointer active:scale-[0.98]')
                  }
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  <span>Continuar con Google</span>
                </button>

                {savedGoogleAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setGoogleMode('picker')}
                    className="text-xs text-[#1d9bf0] hover:underline font-bold text-center cursor-pointer mt-1"
                  >
                    Volver a cuentas guardadas en este navegador
                  </button>
                )}
              </form>
            )}
          </div>
        )}

        {/* PASO 6: APPLE ID - LIMPIO Y BASADO EN CUENTAS DE ESTE NAVEGADOR */}
        {step === 'apple' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {appleMode === 'picker' && savedAppleAccounts.length > 0 ? (
              <>
                <p className="text-xs text-[#71767b]">
                  Elige un Apple ID guardado en este navegador:
                </p>

                <div className="flex flex-col divide-y divide-[#2f3336]/60 border border-[#2f3336] rounded-xl overflow-hidden">
                  {savedAppleAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group"
                    >
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handlePerformSocial('apple', acc.email, acc.name)}
                        className="flex items-center gap-3.5 text-left flex-1 min-w-0 cursor-pointer disabled:opacity-50"
                      >
                        <div className="w-9 h-9 rounded-full bg-white/10 text-white font-black text-sm flex items-center justify-center shrink-0 border border-white/20">
                          {acc.name ? acc.name.charAt(0).toUpperCase() : acc.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold text-white text-sm truncate">{acc.name || acc.email}</span>
                          <span className="text-xs text-[#71767b] truncate">{acc.email}</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAppleAccountFromBrowser(acc.email);
                        }}
                        title="Quitar de este navegador"
                        className="p-1.5 text-[#71767b] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors ml-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAppleMode('input')}
                    className="p-3.5 text-xs text-[#1d9bf0] hover:bg-white/5 font-bold transition-colors text-center w-full cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Usar otro ID de Apple</span>
                  </button>
                </div>
              </>
            ) : (
              /* Modo limpio directo para ingresar Apple ID */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleanPrefix = appleEmail.trim().split('@')[0].replace(/[^a-z0-9_]/g, '');
                  const resolvedEmail =
                    appleOption === 'share'
                      ? appleEmail.trim()
                      : cleanPrefix + '.relay@privaterelay.appleid.com';
                  handlePerformSocial('apple', resolvedEmail, appleName);
                }}
                className="flex flex-col gap-3.5"
              >
                <p className="text-xs text-[#71767b]">
                  Ingresa tu ID de Apple para configurar tu acceso:
                </p>

                <div className="border border-[#2f3336] focus-within:border-[#1d9bf0] rounded-md px-3.5 py-3 transition-colors bg-black">
                  <input
                    type="email"
                    required
                    autoFocus
                    value={appleEmail}
                    onChange={(e) => setAppleEmail(e.target.value)}
                    placeholder="ID de Apple (correo electrónico)"
                    className="w-full bg-transparent text-white outline-none text-[15px] placeholder-[#71767b]"
                  />
                </div>

                <div className="border border-[#2f3336] focus-within:border-[#1d9bf0] rounded-md px-3.5 py-3 transition-colors bg-black">
                  <input
                    type="text"
                    value={appleName}
                    onChange={(e) => setAppleName(e.target.value)}
                    placeholder="Nombre para mostrar (opcional)"
                    className="w-full bg-transparent text-white outline-none text-[15px] placeholder-[#71767b]"
                  />
                </div>

                {/* Opciones de privacidad de Apple ID */}
                <div className="flex flex-col gap-2 border border-[#2f3336] rounded-xl p-3 bg-[#16181c]/40 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
                    <input
                      type="radio"
                      name="appleOption"
                      checked={appleOption === 'share'}
                      onChange={() => setAppleOption('share')}
                      className="accent-white cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-white">Compartir mi correo electrónico</span>
                      <span className="text-[11px] text-[#71767b]">
                        {appleEmail.trim() || 'tu_correo@icloud.com'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
                    <input
                      type="radio"
                      name="appleOption"
                      checked={appleOption === 'hide'}
                      onChange={() => setAppleOption('hide')}
                      className="accent-white cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-white">Ocultar mi correo</span>
                      <span className="text-[11px] text-[#71767b]">
                        {(appleEmail.trim().split('@')[0] || 'usuario') + '.relay@privaterelay.appleid.com'}
                      </span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!appleEmail.trim() || loading}
                  className={
                    'w-full font-bold py-3 rounded-full text-[15px] transition-all flex items-center justify-center gap-2 ' +
                    (!appleEmail.trim() || loading
                      ? 'bg-[#333639] text-[#71767b] cursor-not-allowed'
                      : 'bg-white hover:bg-[#e6e6e6] text-black cursor-pointer active:scale-[0.98]')
                  }
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  <span>Continuar con Apple ID</span>
                </button>

                {savedAppleAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAppleMode('picker')}
                    className="text-xs text-[#1d9bf0] hover:underline font-bold text-center cursor-pointer mt-1"
                  >
                    Volver a cuentas guardadas en este navegador
                  </button>
                )}
              </form>
            )}
          </div>
        )}

        {/* Footer text */}
        <p className="text-[12px] text-[#71767b] leading-relaxed text-center mt-6 px-1">
          Al continuar, aceptas nuestros{' '}
          <span className="text-white hover:underline cursor-pointer">Términos de servicio</span>,{' '}
          <span className="text-white hover:underline cursor-pointer">Política de privacidad</span> y{' '}
          <span className="text-white hover:underline cursor-pointer">Uso de cookies</span>.
        </p>

        {/* Switch to Register */}
        <div className="mt-4 pt-3 border-t border-[#2f3336]/40 text-center">
          <p className="text-[13px] text-[#71767b]">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => {
                if (onSwitchToRegister) {
                  onSwitchToRegister();
                } else {
                  onClose();
                }
              }}
              className="text-[#1d9bf0] hover:underline cursor-pointer font-bold inline"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
