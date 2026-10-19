import React, { useState } from 'react';
import { TalmaLogo } from './TalmaLogo';
import { AuthModal } from './AuthModal';
import { RegisterModal } from './RegisterModal';
import { UserProfile } from '../types';

interface LandingViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onLoginSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#1d9bf0]/30 overflow-x-hidden">
      {/* Main Content Area: Focused, sleek mobile layout matching image m02129 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full text-center">
        {/* Prominent Center Logo */}
        <div className="mb-10 sm:mb-12 flex justify-center transform hover:scale-105 transition-transform duration-300">
          <TalmaLogo size="2xl" variant="icon" className="scale-[1.8] sm:scale-[2.2]" />
        </div>

        {/* Title matching image m02129 */}
        <h1 className="text-[28px] sm:text-[34px] font-black tracking-tight text-white leading-tight mb-8 sm:mb-10 max-w-sm">
          Descubre lo que está pasando
        </h1>

        {/* Action Buttons Container */}
        <div className="w-full max-w-[320px] flex flex-col items-center gap-3">
          {/* Main Pill: Crear cuenta */}
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="w-full bg-white hover:bg-[#e6e6e6] text-black font-extrabold py-3.5 px-6 rounded-full text-[15px] shadow-lg shadow-white/5 active:scale-[0.98] transition-all cursor-pointer select-none"
          >
            Crear cuenta
          </button>

          {/* Subheading */}
          <span className="text-[14px] font-bold text-white mt-6 mb-1">
            ¿Ya tienes una cuenta?
          </span>

          {/* Outline Pill: Iniciar sesión */}
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="w-full py-3.5 px-6 border border-[#536471] hover:bg-white/10 text-white font-bold rounded-full text-[15px] transition-colors cursor-pointer select-none"
          >
            Iniciar sesión
          </button>
        </div>
      </div>

      {/* Footer Links matching image m02129 */}
      <footer className="py-4 px-6 border-t border-[#2f3336]/30 text-center text-[11px] text-[#71767b] flex flex-wrap justify-center gap-x-3 gap-y-1.5 select-none">
        <span className="hover:underline cursor-pointer">Información</span>
        <span className="hover:underline cursor-pointer">Obtener la app</span>
        <span className="hover:underline cursor-pointer">Ayuda</span>
        <span className="hover:underline cursor-pointer">Términos</span>
        <span className="hover:underline cursor-pointer">Privacidad</span>
        <span className="hover:underline cursor-pointer">Cookies</span>
        <span className="hover:underline cursor-pointer">Empleos</span>
        <span className="hover:underline cursor-pointer">Anuncios y empresas</span>
        <span className="hover:underline cursor-pointer">Desarrolladores</span>
        <span className="hover:underline cursor-pointer">Noticias</span>
        <span className="hover:underline cursor-pointer">Accesibilidad</span>
        <span>© 2026 Talma Corp.</span>
      </footer>

      {/* Sign In Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setShowAuthModal(false);
            onLoginSuccess(user);
          }}
          onSwitchToRegister={() => {
            setShowAuthModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(user) => {
            setShowRegisterModal(false);
            onLoginSuccess(user);
          }}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowAuthModal(true);
          }}
        />
      )}
    </div>
  );
};
