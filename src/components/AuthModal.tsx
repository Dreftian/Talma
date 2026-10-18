import React, { useState } from 'react';
import { X, Loader2, ShieldCheck, Key } from 'lucide-react';
import { TalmaLogo } from './TalmaLogo';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, id: identifier, username: identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickLogin = () => {
    setIdentifier('admin');
    setPassword('admin');
    setLoading(true);
    setError(null);

    fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'admin', password: 'admin' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          onLoginSuccess(data.user);
          onClose();
        } else {
          setError(data.error || 'Error al autenticar admin');
        }
      })
      .catch((err) => setError(err.message || 'Error de red'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-[#2f3336] rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl animate-pop-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-white hover:bg-[#181818] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <TalmaLogo size="xl" variant="icon" />
          <h2 className="font-black text-2xl text-white mt-4">
            Inicia sesión en Talma
          </h2>
          <p className="text-sm text-[#71767b] mt-1">
            Plataforma 100% gratuita · Conectada a Supabase
          </p>
        </div>

        {/* Admin Credential Notice */}
        <div className="mt-4 p-3 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#22c55e] shrink-0" />
          <div className="text-left text-xs leading-tight">
            <span className="font-bold text-white block">Cuenta de Administrador:</span>
            <span className="text-[#e7e9ea] font-mono mt-0.5 inline-block">ID: <b className="text-[#22c55e]">admin</b> &nbsp;|&nbsp; Contraseña: <b className="text-[#22c55e]">admin</b></span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-red-950/40 border border-red-800 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div className="border border-[#2f3336] rounded-lg p-2.5 focus-within:border-[#22c55e] transition-colors">
            <label className="text-xs text-[#71767b] block font-medium">ID o Usuario</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin"
              className="w-full bg-transparent text-[#e7e9ea] outline-none text-sm mt-0.5 font-medium"
            />
          </div>

          <div className="border border-[#2f3336] rounded-lg p-2.5 focus-within:border-[#22c55e] transition-colors">
            <label className="text-xs text-[#71767b] block font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
              className="w-full bg-transparent text-[#e7e9ea] outline-none text-sm mt-0.5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold py-3 rounded-full text-base transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>Iniciar sesión</span>
          </button>
        </form>

        {/* 1-Click Fast Login for Admin */}
        <div className="mt-5 pt-4 border-t border-[#2f3336]">
          <button
            type="button"
            onClick={handleAdminQuickLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#16181c] hover:bg-[#202327] border border-[#2f3336] hover:border-[#22c55e]/50 rounded-xl text-sm font-bold text-[#e7e9ea] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Key className="w-4 h-4 text-[#22c55e]" />
            <span>⚡ Ingreso rápido como Admin (admin / admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
