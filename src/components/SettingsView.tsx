import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  User,
  Lock,
  ShieldCheck,
  Bell,
  Eye,
  ChevronRight,
  LogOut,
  HelpCircle,
  Sliders,
  CheckCircle2,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AccountSettings, AccountSubSection } from './settings/AccountSettings';
import { SecuritySettings, SecuritySubSection } from './settings/SecuritySettings';
import { PrivacySettings, PrivacySubSection } from './settings/PrivacySettings';
import { NotificationSettings, NotificationSubSection } from './settings/NotificationSettings';
import { AccessibilitySettings, AccessibilitySubSection } from './settings/AccessibilitySettings';
import { ResourcesSettings, ResourcesSubSection } from './settings/ResourcesSettings';

interface SettingsViewProps {
  currentUser: UserProfile;
  onBack: () => void;
  onLogout?: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

type AnySettingsSection =
  | 'main'
  | AccountSubSection
  | SecuritySubSection
  | PrivacySubSection
  | NotificationSubSection
  | AccessibilitySubSection
  | ResourcesSubSection;

interface SearchItem {
  id: string;
  title: string;
  section: AnySettingsSection;
  category: string;
  keywords: string[];
  description: string;
}

const SEARCH_INDEX: SearchItem[] = [
  // Tu cuenta
  {
    id: 'your_account',
    title: 'Tu cuenta',
    section: 'your_account',
    category: 'Cuenta',
    keywords: ['cuenta', 'usuario', 'datos', 'desactivar', 'perfil'],
    description: 'Consulta información, descarga tus datos o desactiva tu cuenta.',
  },
  {
    id: 'account_info',
    title: 'Información de la cuenta',
    section: 'account_info',
    category: 'Cuenta',
    keywords: ['telefono', 'correo', 'email', 'pais', 'genero', 'nacimiento', 'informacion'],
    description: 'Consulta y edita tu teléfono, correo, país y género.',
  },
  {
    id: 'username_edit',
    title: 'Nombre de usuario (@handle)',
    section: 'username_edit',
    category: 'Cuenta',
    keywords: ['nombre', 'usuario', 'username', 'handle', 'cambiar'],
    description: 'Actualiza tu @nombre_de_usuario público en Talma.',
  },
  {
    id: 'phone_edit',
    title: 'Número de teléfono',
    section: 'phone_edit',
    category: 'Cuenta',
    keywords: ['telefono', 'celular', 'sms', 'numero', 'movil'],
    description: 'Asocia o verifica tu número telefónico con código SMS.',
  },
  {
    id: 'country_select',
    title: 'País de residencia',
    section: 'country_select',
    category: 'Cuenta',
    keywords: ['pais', 'nacion', 'ubicacion', 'residencia', 'region'],
    description: 'Selecciona tu país para ajustar la experiencia regional.',
  },
  {
    id: 'change_password',
    title: 'Cambia tu contraseña',
    section: 'change_password',
    category: 'Cuenta',
    keywords: ['password', 'contraseña', 'clave', 'seguridad', 'cambiar'],
    description: 'Actualiza tu contraseña de acceso con validación segura.',
  },
  {
    id: 'download_data',
    title: 'Descargar un archivo con tus datos',
    section: 'download_data',
    category: 'Cuenta',
    keywords: ['descargar', 'archivo', 'datos', 'exportar', 'json', 'copia', 'backup'],
    description: 'Exporta una copia completa de tus posts, perfil e interacciones.',
  },
  {
    id: 'deactivate_account',
    title: 'Desactiva tu cuenta',
    section: 'deactivate_account',
    category: 'Cuenta',
    keywords: ['desactivar', 'eliminar', 'cerrar', 'borrar', 'cuenta', 'baja'],
    description: 'Pausa o desactiva tu cuenta de Talma temporalmente.',
  },

  // Seguridad y acceso
  {
    id: 'security_access',
    title: 'Seguridad y acceso a la cuenta',
    section: 'security_access',
    category: 'Seguridad',
    keywords: ['seguridad', 'acceso', 'apps', 'sesiones', 'delega', 'login'],
    description: 'Administra la seguridad, 2FA, sesiones activas y delegados.',
  },
  {
    id: 'two_factor_auth',
    title: 'Autenticación en dos fases (2FA)',
    section: 'two_factor_auth',
    category: 'Seguridad',
    keywords: ['2fa', 'autenticacion', 'totp', 'google authenticator', 'sms', 'llave', 'seguridad'],
    description: 'Configura verificación por SMS, apps TOTP o llaves de seguridad.',
  },
  {
    id: 'identity_verification',
    title: 'Verificación de documento de identidad',
    section: 'identity_verification',
    category: 'Seguridad',
    keywords: ['verificacion', 'identidad', 'dni', 'pasaporte', 'verificado', 'insignia', 'documento'],
    description: 'Sube tu documento de identidad para obtener la insignia verificada.',
  },
  {
    id: 'passkeys',
    title: 'Administrar claves de acceso (Passkeys)',
    section: 'passkeys',
    category: 'Seguridad',
    keywords: ['passkey', 'passkeys', 'claves', 'acceso', 'huella', 'face id', 'biometria'],
    description: 'Inicia sesión con biometría sin contraseñas.',
  },
  {
    id: 'connected_apps',
    title: 'Aplicaciones conectadas',
    section: 'connected_apps',
    category: 'Seguridad',
    keywords: ['apps', 'aplicaciones', 'conectadas', 'permisos', 'revocar', 'oauth'],
    description: 'Revisa qué aplicaciones tienen acceso a tu cuenta.',
  },
  {
    id: 'active_sessions',
    title: 'Sesiones activas',
    section: 'active_sessions',
    category: 'Seguridad',
    keywords: ['sesiones', 'activas', 'dispositivos', 'cerrar', 'ip', 'login'],
    description: 'Revisa tus sesiones abiertas y ciérralas en otros dispositivos.',
  },
  {
    id: 'delegate',
    title: 'Delega',
    section: 'delegate',
    category: 'Seguridad',
    keywords: ['delega', 'delegar', 'compartir', 'roles', 'miembros', 'invitar', 'administrador'],
    description: 'Comparte tu cuenta con otros usuarios mediante roles sin dar tu contraseña.',
  },

  // Privacidad y seguridad
  {
    id: 'privacy_safety',
    title: 'Privacidad y seguridad',
    section: 'privacy_safety',
    category: 'Privacidad',
    keywords: ['privacidad', 'seguridad', 'bloquear', 'silenciar', 'dms', 'mensajes'],
    description: 'Controla quién puede ver tus publicaciones y comunicarse contigo.',
  },
  {
    id: 'privacy_audience',
    title: 'Audiencia y etiquetas (Proteger tweets)',
    section: 'privacy_audience',
    category: 'Privacidad',
    keywords: ['proteger', 'publicaciones', 'tweets', 'privada', 'audiencia', 'etiquetas'],
    description: 'Haz privada tu cuenta para que solo seguidores aprobados vean tus posts.',
  },
  {
    id: 'blocked_accounts',
    title: 'Cuentas bloqueadas',
    section: 'blocked_accounts',
    category: 'Privacidad',
    keywords: ['bloquear', 'bloqueadas', 'bloqueo', 'desbloquear', 'usuarios'],
    description: 'Administra la lista de usuarios que tienes bloqueados.',
  },
  {
    id: 'muted_accounts',
    title: 'Cuentas silenciadas',
    section: 'muted_accounts',
    category: 'Privacidad',
    keywords: ['silenciar', 'silenciadas', 'silencio', 'desilenciar', 'cuentas'],
    description: 'Consulta y desilencia cuentas en tu cronología.',
  },
  {
    id: 'muted_words',
    title: 'Palabras silenciadas',
    section: 'muted_words',
    category: 'Privacidad',
    keywords: ['palabras', 'silenciadas', 'hashtags', 'frases', 'filtros', 'silenciar'],
    description: 'Oculta tweets que contengan ciertas palabras o hashtags.',
  },
  {
    id: 'privacy_dms',
    title: 'Privacidad de mensajes directos',
    section: 'privacy_dms',
    category: 'Privacidad',
    keywords: ['mensajes', 'directos', 'dm', 'chat', 'lectura', 'visto', 'spam'],
    description: 'Ajusta quién puede enviarte mensajes y confirmaciones de lectura.',
  },

  // Notificaciones
  {
    id: 'notifications_root',
    title: 'Notificaciones',
    section: 'notifications_root',
    category: 'Notificaciones',
    keywords: ['notificaciones', 'alertas', 'avisos', 'filtros', 'campana'],
    description: 'Filtra y personaliza tus alertas push, correo y SMS.',
  },
  {
    id: 'push_notifications',
    title: 'Notificaciones push',
    section: 'push_notifications',
    category: 'Notificaciones',
    keywords: ['push', 'notificaciones', 'likes', 'menciones', 'retweets', 'seguidores'],
    description: 'Alertas inmediatas para likes, menciones, retweets y nuevos seguidores.',
  },

  // Accesibilidad y pantalla
  {
    id: 'accessibility_root',
    title: 'Accesibilidad, pantalla e idiomas',
    section: 'accessibility_root',
    category: 'Pantalla',
    keywords: ['accesibilidad', 'pantalla', 'idiomas', 'fuente', 'tema', 'colores'],
    description: 'Personaliza fuentes, contraste, tema oscuro y consumo de datos.',
  },
  {
    id: 'display_details',
    title: 'Pantalla y tema (Tamaño y color)',
    section: 'display_details',
    category: 'Pantalla',
    keywords: ['pantalla', 'tema', 'fondo', 'oscuro', 'azul', 'fuente', 'colores'],
    description: 'Cambia el tamaño del texto, color de acento y modo de fondo.',
  },
  {
    id: 'languages_details',
    title: 'Idiomas de la aplicación',
    section: 'languages_details',
    category: 'Pantalla',
    keywords: ['idioma', 'idiomas', 'language', 'español', 'ingles', 'traduccion'],
    description: 'Selecciona el idioma de la interfaz de Talma.',
  },

  // Recursos
  {
    id: 'resources_root',
    title: 'Recursos adicionales',
    section: 'resources_root',
    category: 'Recursos',
    keywords: ['recursos', 'ayuda', 'soporte', 'terminos', 'privacidad', 'estado'],
    description: 'Centro de ayuda, soporte técnico, condiciones y estado del servidor.',
  },
  {
    id: 'help_center',
    title: 'Centro de ayuda y soporte técnico',
    section: 'help_center',
    category: 'Recursos',
    keywords: ['ayuda', 'soporte', 'faq', 'preguntas', 'ticket', 'contacto', 'problema'],
    description: 'Preguntas frecuentes y envío de tickets de consulta al equipo.',
  },
  {
    id: 'system_status',
    title: 'Estado de los servidores y red',
    section: 'system_status',
    category: 'Recursos',
    keywords: ['servidores', 'estado', 'status', 'latencia', 'api', 'supabase', 'uptime'],
    description: 'Monitor en tiempo real del API, base de datos y WebSocket.',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onBack,
  onLogout,
  onProfileUpdated,
}) => {
  const [currentSection, setCurrentSection] = useState<AnySettingsSection>('main');
  const [sectionStack, setSectionStack] = useState<AnySettingsSection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const navigateTo = (sec: AnySettingsSection) => {
    setSectionStack((prev) => [...prev, currentSection]);
    setCurrentSection(sec);
  };

  const handleBack = () => {
    if (sectionStack.length > 0) {
      const prev = sectionStack[sectionStack.length - 1];
      setSectionStack((s) => s.slice(0, -1));
      setCurrentSection(prev);
    } else {
      onBack();
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filtered search results
  const searchResults = searchQuery.trim()
    ? SEARCH_INDEX.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(q))
        );
      })
    : [];

  /* ========================================================= */
  /* SUB-MODULE ROUTING */
  /* ========================================================= */
  const isAccountSection = (sec: AnySettingsSection): sec is AccountSubSection => {
    return [
      'your_account',
      'account_info',
      'username_edit',
      'phone_edit',
      'country_select',
      'gender_select',
      'birth_date_edit',
      'profile_label',
      'change_password',
      'download_data',
      'deactivate_account',
    ].includes(sec as any);
  };

  const isSecuritySection = (sec: AnySettingsSection): sec is SecuritySubSection => {
    return [
      'security_access',
      'security_details',
      'two_factor_auth',
      'identity_verification',
      'passkeys',
      'apps_sessions',
      'connected_apps',
      'active_sessions',
      'access_history',
      'logged_devices',
      'delegate',
      'delegate_accounts',
      'delegate_members',
    ].includes(sec as any);
  };

  const isPrivacySection = (sec: AnySettingsSection): sec is PrivacySubSection => {
    return [
      'privacy_safety',
      'privacy_audience',
      'privacy_posts',
      'privacy_content',
      'privacy_mute_block',
      'blocked_accounts',
      'muted_accounts',
      'muted_words',
      'privacy_dms',
      'privacy_spaces',
      'privacy_discovery',
    ].includes(sec as any);
  };

  const isNotificationSection = (sec: AnySettingsSection): sec is NotificationSubSection => {
    return [
      'notifications_root',
      'notification_filters',
      'advanced_filters',
      'notification_preferences',
      'push_notifications',
      'email_notifications',
      'sms_notifications',
    ].includes(sec as any);
  };

  const isAccessibilitySection = (sec: AnySettingsSection): sec is AccessibilitySubSection => {
    return [
      'accessibility_root',
      'accessibility_details',
      'display_details',
      'languages_details',
      'data_usage',
    ].includes(sec as any);
  };

  const isResourcesSection = (sec: AnySettingsSection): sec is ResourcesSubSection => {
    return [
      'resources_root',
      'help_center',
      'terms_of_service',
      'privacy_policy',
      'cookies_policy',
      'legal_notices',
      'system_status',
    ].includes(sec as any);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-[#e7e9ea] pb-24 relative select-none">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1d9bf0] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-pop-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. MAIN SETTINGS ROOT VIEW (Matches 6.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'main' && (
        <div className="flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-[19px] text-white leading-tight">Configuración</h1>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          {/* Search Pill */}
          <div className="p-3">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#16181c] border border-transparent focus-within:border-[#1d9bf0] focus-within:bg-black transition-all">
              <Search className="w-4 h-4 text-[#71767b] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Configuración de búsqueda"
                className="bg-transparent border-none outline-none text-[15px] text-white placeholder-[#71767b] w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 text-[#71767b] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* If Search is Active */}
          {searchQuery.trim() ? (
            <div className="flex flex-col divide-y divide-[#2f3336]/40 px-2">
              <div className="p-3 text-xs font-bold text-[#71767b] uppercase tracking-wider">
                Resultados para "{searchQuery}" ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#71767b]">
                  No se encontraron opciones de configuración que coincidan con tu búsqueda.
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      navigateTo(item.section);
                      setSearchQuery('');
                    }}
                    className="w-full text-left flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer rounded-xl transition-colors"
                  >
                    <div className="flex-1 pr-3">
                      <span className="text-xs font-bold text-[#1d9bf0] uppercase block">{item.category}</span>
                      <span className="font-bold text-white text-[15px] block mt-0.5">{item.title}</span>
                      <p className="text-xs text-[#71767b] mt-0.5">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0" />
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Main List Items (matching 6.jpeg) */
            <div className="flex flex-col divide-y divide-[#2f3336]/40">
              {/* 1. Tu cuenta */}
              <button
                type="button"
                onClick={() => navigateTo('your_account')}
                className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <User className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-[16px] text-white leading-tight">Tu cuenta</h3>
                  <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                    Consulta la información de tu cuenta, descarga un archivo con tus datos u obtén más información acerca de las opciones de desactivación de la cuenta.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
              </button>

              {/* 2. Seguridad y acceso a la cuenta */}
              <button
                type="button"
                onClick={() => navigateTo('security_access')}
                className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <Lock className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-[16px] text-white leading-tight">Seguridad y acceso a la cuenta</h3>
                  <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                    Administra la seguridad de tu cuenta y lleva un control de su uso, incluidas las apps que conectaste a ella.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
              </button>

              {/* 3. Privacidad y seguridad */}
              <button
                type="button"
                onClick={() => navigateTo('privacy_safety')}
                className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-[16px] text-white leading-tight">Privacidad y seguridad</h3>
                  <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                    Administra qué información ves y compartes en Talma.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
              </button>

              {/* 4. Notificaciones */}
              <button
                type="button"
                onClick={() => navigateTo('notifications_root')}
                className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <Bell className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-[16px] text-white leading-tight">Notificaciones</h3>
                  <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                    Selecciona el tipo de notificaciones que quieres recibir sobre tus actividades, tus intereses y tus recomendaciones.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
              </button>

              {/* 5. Accesibilidad, pantalla e idiomas */}
              <button
                type="button"
                onClick={() => navigateTo('accessibility_root')}
                className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <Eye className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-[16px] text-white leading-tight">Accesibilidad, pantalla e idiomas</h3>
                  <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                    Administra la forma en que se muestra el contenido de Talma y personaliza tu experiencia visual y de lectura.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
              </button>

              {/* 6. Recursos adicionales */}
              <button
                type="button"
                onClick={() => navigateTo('resources_root')}
                className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <HelpCircle className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-[16px] text-white leading-tight">Recursos adicionales</h3>
                  <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                    Consulta información sobre las políticas de Talma, centro de soporte técnico y estado del servicio.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
              </button>

              {/* Cerrar sesión */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full text-left flex items-center gap-4 p-4 hover:bg-red-500/10 cursor-pointer text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-[15px]">Cerrar sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SUB-SECTIONS ROUTER */}
      {/* ========================================================= */}
      {isAccountSection(currentSection) && (
        <AccountSettings
          section={currentSection}
          currentUser={currentUser}
          onNavigate={(sec) => navigateTo(sec)}
          onBack={handleBack}
          showToast={showToast}
          onUpdateUser={(updated: Partial<UserProfile>) => onProfileUpdated?.({ ...currentUser, ...updated })}
          onLogout={onLogout}
        />
      )}

      {isSecuritySection(currentSection) && (
        <SecuritySettings
          section={currentSection}
          currentUser={currentUser}
          onNavigate={(sec) => navigateTo(sec)}
          onBack={handleBack}
          showToast={showToast}
        />
      )}

      {isPrivacySection(currentSection) && (
        <PrivacySettings
          section={currentSection}
          currentUser={currentUser}
          onNavigate={(sec) => navigateTo(sec)}
          onBack={handleBack}
          showToast={showToast}
          onUpdateUser={(updated: Partial<UserProfile>) => onProfileUpdated?.({ ...currentUser, ...updated })}
        />
      )}

      {isNotificationSection(currentSection) && (
        <NotificationSettings
          section={currentSection}
          currentUser={currentUser}
          onNavigate={(sec) => navigateTo(sec)}
          onBack={handleBack}
          showToast={showToast}
        />
      )}

      {isAccessibilitySection(currentSection) && (
        <AccessibilitySettings
          section={currentSection}
          currentUser={currentUser}
          onNavigate={(sec) => navigateTo(sec)}
          onBack={handleBack}
          showToast={showToast}
        />
      )}

      {isResourcesSection(currentSection) && (
        <ResourcesSettings
          section={currentSection}
          currentUser={currentUser}
          onNavigate={(sec) => navigateTo(sec)}
          onBack={handleBack}
          showToast={showToast}
        />
      )}
    </div>
  );
};
