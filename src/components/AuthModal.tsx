import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { TalmaLogo } from './TalmaLogo';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
    const payload = isSignUp ? { email, password, name, username } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al autenticar');
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = (demoId: string) => {
    fetch(`/api/users/me?userId=${demoId}`)
      .then((r) => r.json())
      .then((user) => {
        onLoginSuccess(user);
        onClose();
      })
      .catch((err) => console.error(err));
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
            {isSignUp ? 'Únete a Talma hoy' : 'Inicia sesión en Talma'}
          </h2>
          <p className="text-sm text-[#71767b] mt-1">
            Conectado directamente a tu proyecto de Supabase
          </p>
        </div>

        {error && (
          <div className="mt-4 p-2.5 bg-red-950/40 border border-red-800 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          {isSignUp && (
            <>
              <div className="border border-[#2f3336] rounded-lg p-2 focus-within:border-[#22c55e]">
                <label className="text-xs text-[#71767b] block">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Dreftian"
                  className="w-full bg-transparent text-[#e7e9ea] outline-none text-sm mt-0.5"
                />
              </div>

              <div className="border border-[#2f3336] rounded-lg p-2 focus-within:border-[#22c55e]">
                <label className="text-xs text-[#71767b] block">Nombre de usuario</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dreftian"
                  className="w-full bg-transparent text-[#e7e9ea] outline-none text-sm mt-0.5"
                />
              </div>
            </>
          )}

          <div className="border border-[#2f3336] rounded-lg p-2 focus-within:border-[#22c55e]">
            <label className="text-xs text-[#71767b] block">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full bg-transparent text-[#e7e9ea] outline-none text-sm mt-0.5"
            />
          </div>

          <div className="border border-[#2f3336] rounded-lg p-2 focus-within:border-[#22c55e]">
            <label className="text-xs text-[#71767b] block">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-[#e7e9ea] outline-none text-sm mt-0.5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold py-3 rounded-full text-base transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</span>
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-[#22c55e] hover:underline"
          >
            {isSignUp
              ? '¿Ya tienes una cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        {/* Quick test accounts */}
        <div className="mt-6 pt-4 border-t border-[#2f3336]">
          <span className="text-xs text-[#71767b] font-medium block text-center mb-2">
            O selecciona una cuenta de prueba instantánea:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'usr_dreftian', name: 'Dreftian (@dreftian)' },
              { id: 'usr_talma', name: 'Talma Oficial' },
              { id: 'usr_supabase', name: 'Supabase' },
              { id: 'usr_elonmusk', name: 'Elon Musk' },
            ].map((acc) => (
              <button
                key={acc.id}
                onClick={() => handleSelectDemoAccount(acc.id)}
                className="text-xs py-1.5 px-2 bg-[#16181c] hover:bg-[#202327] text-[#e7e9ea] rounded-lg border border-[#2f3336] truncate"
              >
                {acc.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
