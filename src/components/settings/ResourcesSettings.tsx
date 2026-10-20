import React, { useState } from 'react';
import {
  HelpCircle,
  FileText,
  Shield,
  Cookie,
  Info,
  Server,
  ChevronRight,
  ExternalLink,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SettingsSubHeader } from './common';

export type ResourcesSubSection =
  | 'resources_root'
  | 'help_center'
  | 'terms_of_service'
  | 'privacy_policy'
  | 'cookies_policy'
  | 'legal_notices'
  | 'system_status';

interface ResourcesSettingsProps {
  section: ResourcesSubSection;
  currentUser: UserProfile;
  onNavigate: (section: ResourcesSubSection) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const ResourcesSettings: React.FC<ResourcesSettingsProps> = ({
  section,
  currentUser,
  onNavigate,
  onBack,
  showToast,
}) => {
  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  /* ========================================================= */
  /* ROOT: RECURSOS ADICIONALES */
  /* ========================================================= */
  if (section === 'resources_root') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Recursos adicionales"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Consulta información sobre las políticas de Talma, centro de soporte técnico y estado del servicio.
        </p>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          <div
            onClick={() => onNavigate('help_center')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Centro de ayuda y soporte</span>
              <span className="text-[13px] text-[#71767b]">Preguntas frecuentes y contacto con el equipo de soporte.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('terms_of_service')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <FileText className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Condiciones de servicio</span>
              <span className="text-[13px] text-[#71767b]">Acuerdo legal entre tú y Talma.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('privacy_policy')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Shield className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Política de privacidad</span>
              <span className="text-[13px] text-[#71767b]">Cómo protegemos y tratamos tus datos personales.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('cookies_policy')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Cookie className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Uso de cookies</span>
              <span className="text-[13px] text-[#71767b]">Información sobre almacenamiento local y cookies.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('legal_notices')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Info className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Información legal y licencias</span>
              <span className="text-[13px] text-[#71767b]">Versión del sistema y créditos de código abierto.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('system_status')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Server className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Estado de los servidores</span>
              <span className="text-[13px] text-[#00ba7c]">Todos los servicios funcionando normalmente.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: CENTRO DE AYUDA */
  /* ========================================================= */
  if (section === 'help_center') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Centro de ayuda"
          subtitle="Recursos adicionales"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-base">Preguntas frecuentes (FAQ)</span>
            <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden text-sm">
              <div className="p-4">
                <span className="font-bold text-white block mb-1">¿Cómo verifico mi cuenta?</span>
                <p className="text-xs text-[#71767b]">
                  Dirígete a Seguridad y acceso &gt; Seguridad &gt; Verificación de identidad y adjunta una foto legible de tu documento de identidad.
                </p>
              </div>
              <div className="p-4">
                <span className="font-bold text-white block mb-1">¿Cómo proteger mis publicaciones?</span>
                <p className="text-xs text-[#71767b]">
                  En Privacidad y seguridad &gt; Audiencia y etiquetas, activa la opción "Proteger tus publicaciones" para que solo tus seguidores aprobados puedan ver tu contenido.
                </p>
              </div>
              <div className="p-4">
                <span className="font-bold text-white block mb-1">¿Cómo descargar una copia de mi información?</span>
                <p className="text-xs text-[#71767b]">
                  Ve a Tu cuenta &gt; Descargar un archivo con tus datos, confirma tu contraseña y recibirás un archivo JSON completo estructurado.
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de soporte */}
          <div className="p-4 rounded-2xl bg-[#16181c] border border-[#2f3336] flex flex-col gap-3">
            <span className="font-bold text-white text-sm">Enviar una consulta al equipo técnico</span>
            {ticketSent ? (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Tu mensaje ha sido recibido con el ticket #TLM-{Math.floor(100000 + Math.random() * 900000)}. Te responderemos pronto.</span>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Asunto de la consulta"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="p-3 bg-black border border-[#2f3336] rounded-xl text-white outline-none text-xs"
                />
                <textarea
                  rows={3}
                  placeholder="Describe con detalle el inconveniente o sugerencia..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="p-3 bg-black border border-[#2f3336] rounded-xl text-white outline-none text-xs resize-none"
                />
                <button
                  onClick={() => {
                    if (!ticketSubject.trim() || !ticketMessage.trim()) {
                      showToast('Completa el asunto y el mensaje');
                      return;
                    }
                    setTicketSent(true);
                    showToast('Ticket de soporte enviado correctamente');
                  }}
                  className="py-2.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar ticket
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: CONDICIONES DE SERVICIO */
  /* ========================================================= */
  if (section === 'terms_of_service') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Condiciones de servicio"
          subtitle="Recursos adicionales"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4 text-xs text-[#71767b] leading-relaxed">
          <p className="font-bold text-white text-sm">Vigente a partir de octubre de 2026</p>
          <p>
            Bienvenido a Talma. Al utilizar nuestros servicios, aplicaciones y sitio web, aceptas quedar vinculado por estas Condiciones.
          </p>
          <h4 className="font-bold text-white text-xs mt-2">1. Quién puede usar los servicios</h4>
          <p>
            Debes tener al menos 13 años para crear una cuenta en Talma y contar con la capacidad legal requerida para aceptar este acuerdo.
          </p>
          <h4 className="font-bold text-white text-xs mt-2">2. Contenido en los servicios</h4>
          <p>
            Eres el único responsable del uso que hagas de los servicios y de cualquier contenido que proporciones, incluidas las leyes, normas y reglamentos aplicables.
          </p>
          <h4 className="font-bold text-white text-xs mt-2">3. Derechos sobre tu contenido</h4>
          <p>
            Conservas tus derechos sobre cualquier contenido que envíes, publiques o muestres a través de nuestros servicios. Lo que es tuyo sigue siendo tuyo.
          </p>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: POLÍTICA DE PRIVACIDAD */
  /* ========================================================= */
  if (section === 'privacy_policy') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Política de privacidad"
          subtitle="Recursos adicionales"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4 text-xs text-[#71767b] leading-relaxed">
          <p className="font-bold text-white text-sm">Privacidad en Talma</p>
          <p>
            Nos tomamos en serio tu privacidad. Nunca vendemos tus datos personales ni compartimos información privada sin tu consentimiento explícito.
          </p>
          <h4 className="font-bold text-white text-xs mt-2">Información que recopilamos</h4>
          <p>
            Recopilamos la información básica de tu cuenta (nombre de usuario, correo electrónico, publicaciones, interacciones e IP de registro) exclusivamente para proveer el servicio de microblogging.
          </p>
          <h4 className="font-bold text-white text-xs mt-2">Control de tus datos</h4>
          <p>
            Tienes derecho a descargar una copia completa de todos tus datos en cualquier momento desde la sección "Tu cuenta &gt; Descargar un archivo con tus datos".
          </p>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: USO DE COOKIES */
  /* ========================================================= */
  if (section === 'cookies_policy') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Uso de cookies"
          subtitle="Recursos adicionales"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4 text-xs text-[#71767b] leading-relaxed">
          <p className="font-bold text-white text-sm">Política de cookies y almacenamiento</p>
          <p>
            Talma utiliza almacenamiento local (localStorage) y cookies de sesión esenciales para mantener tu sesión activa y recordar tus preferencias de tema y configuración.
          </p>
          <div className="p-4 rounded-xl bg-[#16181c] border border-[#2f3336]">
            <span className="font-bold text-white block mb-1">Cookies esenciales</span>
            <p className="text-[#71767b]">
              Token de autenticación JWT y estado de sesión. No pueden desactivarse ya que son necesarias para el funcionamiento de la plataforma.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: INFORMACIÓN LEGAL Y LICENCIAS */
  /* ========================================================= */
  if (section === 'legal_notices') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Información legal y licencias"
          subtitle="Recursos adicionales"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4 text-xs text-[#71767b]">
          <div className="p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <span className="font-bold text-white text-sm block">Talma Web Client</span>
            <span className="text-xs text-[#71767b] block mt-1">Versión 12.0.4 - Release (Build 20261020)</span>
            <span className="text-xs text-[#71767b] block mt-0.5">© 2026 Talma Inc. Todos los derechos reservados.</span>
          </div>

          <span className="font-bold text-white text-sm mt-2">Licencias de software de código abierto</span>
          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden font-mono text-[11px]">
            <div className="p-3">React 19.3.1 (MIT License)</div>
            <div className="p-3">Vite 8.3.4 (MIT License)</div>
            <div className="p-3">Tailwind CSS 4.3.3 (MIT License)</div>
            <div className="p-3">Lucide React Icons (ISC License)</div>
            <div className="p-3">Hono Web Framework (MIT License)</div>
            <div className="p-3">Supabase Client (Apache-2.0 License)</div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: ESTADO DEL SISTEMA */
  /* ========================================================= */
  if (section === 'system_status') {
    const services = [
      { name: 'API Server (Hono / Node.js)', status: 'Operativo', latency: '24ms' },
      { name: 'Base de datos principal (Supabase / Postgres)', status: 'Operativo', latency: '42ms' },
      { name: 'WebSocket Realtime Feed', status: 'Conectado', latency: '18ms' },
      { name: 'CDN de imágenes y multimedia', status: 'Operativo', latency: '15ms' },
      { name: 'Servicio de Autenticación JWT', status: 'Operativo', latency: '21ms' },
    ];

    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Estado del sistema"
          subtitle="Recursos adicionales"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-bold text-green-400">Todos los sistemas funcionando al 100%</span>
          </div>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {services.map((s) => (
              <div key={s.name} className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">{s.name}</span>
                  <span className="text-xs text-[#71767b]">Latencia media: {s.latency}</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-bold">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
