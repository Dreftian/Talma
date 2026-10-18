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

  const handleSocialRegister = () => {
    // Open registration modal with pre-fill or directly register
    setShowRegisterModal(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#22c55e]/30">
      {/* Main Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 sm:px-12 py-10 max-w-7xl mx-auto w-full gap-10 lg:gap-20">
        {/* Left Side: Big Logo on Desktop */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end py-6 lg:py-0">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <TalmaLogo size="xl" variant="full" className="scale-125 sm:scale-150 lg:scale-[2]" />
          </div>
        </div>

        {/* Right Side: Headlines & Action Buttons */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center max-w-[500px]">
          {/* Mobile top mini logo */}
          <div className="lg:hidden mb-6">
            <TalmaLogo size="md" variant="icon" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
            Lo que está pasando ahora
          </h1>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-8 sm:mt-12 mb-6">
            Únete hoy.
          </h2>

          <div className="w-full max-w-[340px] flex flex-col gap-3">
            {/* Social Logins */}
            <button
              type="button"
              onClick={handleSocialRegister}
              className="w-full bg-white hover:bg-[#e6e6e6] text-[#0f1419] font-bold py-2.5 px-4 rounded-full text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
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
              <span>Registrarse con Google</span>
            </button>

            <button
              type="button"
              onClick={handleSocialRegister}
              className="w-full bg-white hover:bg-[#e6e6e6] text-[#0f1419] font-bold py-2.5 px-4 rounded-full text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.66-7.85-11.92-14.43-6.28-9.67-11.22-20.73-14.8-33.18-3.58-12.45-5.37-24.3-5.37-35.56 0-16.74 4.54-30.43 13.62-41.07 9.08-10.64 20.35-16.12 33.8-16.44 4.8 0 10.23 1.25 16.3 3.75 6.07 2.5 10.36 3.86 12.87 4.09 2.05-.23 6.35-1.57 12.89-4.04 6.54-2.47 11.77-3.64 15.69-3.53 11.45.65 20.89 4.67 28.32 12.06 7.43 7.39 12.24 16.44 14.42 27.15-10.45 6.31-15.61 14.99-15.48 26.04.13 8.71 3.51 16.27 10.14 22.68 6.63 6.41 14.38 10.12 23.25 11.13-2.18 6.53-4.9 12.84-8.16 18.93zM119.22 31.84c0-7.72 2.76-14.97 8.28-21.75 5.53-6.77 12.43-10.66 20.71-11.66.22 1.3.33 2.45.33 3.44 0 7.82-2.94 15.22-8.81 22.21-5.88 6.98-13.06 10.99-21.56 12.02-.33-1.41-.5-2.73-.5-4.26z" />
              </svg>
              <span>Registrarse con Apple</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-1">
              <div className="flex-1 border-b border-[#2f3336]"></div>
              <span className="px-3 text-[#71767b] text-sm">o</span>
              <div className="flex-1 border-b border-[#2f3336]"></div>
            </div>

            {/* Crear Cuenta Button */}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold py-3 px-4 rounded-full text-sm transition-all active:scale-[0.98] shadow-md cursor-pointer"
            >
              Crear cuenta
            </button>

            {/* Legal terms */}
            <p className="text-[11px] text-[#71767b] leading-tight mt-1">
              Al registrarte, aceptas los{' '}
              <span className="text-[#22c55e] hover:underline cursor-pointer">Términos de servicio</span> y la{' '}
              <span className="text-[#22c55e] hover:underline cursor-pointer">Política de privacidad</span>, incluida la política de{' '}
              <span className="text-[#22c55e] hover:underline cursor-pointer">Uso de Cookies</span>.
            </p>

            {/* Already have an account */}
            <div className="mt-8 flex flex-col gap-3">
              <span className="text-base font-bold text-white">¿Ya tienes una cuenta?</span>
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="w-full py-2.5 px-4 border border-[#536471] hover:bg-white/5 text-[#22c55e] font-bold rounded-full text-sm transition-colors cursor-pointer"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links (Authentic X Footer) */}
      <footer className="py-4 px-6 border-t border-[#2f3336]/40 text-center text-xs text-[#71767b] flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        <span className="hover:underline cursor-pointer">Información</span>
        <span className="hover:underline cursor-pointer">Descarga la app de Talma</span>
        <span className="hover:underline cursor-pointer">Centro de Ayuda</span>
        <span className="hover:underline cursor-pointer">Condiciones de Servicio</span>
        <span className="hover:underline cursor-pointer">Política de Privacidad</span>
        <span className="hover:underline cursor-pointer">Política de cookies</span>
        <span className="hover:underline cursor-pointer">Accesibilidad</span>
        <span className="hover:underline cursor-pointer">Información de anuncios</span>
        <span className="hover:underline cursor-pointer">Blog</span>
        <span className="hover:underline cursor-pointer">Empleos</span>
        <span className="hover:underline cursor-pointer">Recursos de marca</span>
        <span className="hover:underline cursor-pointer">Publicidad</span>
        <span className="hover:underline cursor-pointer">Marketing</span>
        <span className="hover:underline cursor-pointer">Talma para empresas</span>
        <span className="hover:underline cursor-pointer">Desarrolladores</span>
        <span className="hover:underline cursor-pointer">Guía</span>
        <span className="hover:underline cursor-pointer">Configuración</span>
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
