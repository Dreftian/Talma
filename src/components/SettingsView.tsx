import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  User,
  Lock,
  ShieldCheck,
  Bell,
  Eye,
  Link as LinkIcon,
  ChevronRight,
  Phone,
  Mail,
  Megaphone,
  Database,
  Globe,
  Bot,
  Smile,
  LogOut,
  Download,
  HeartCrack,
  Key,
  Smartphone,
  Users,
  PenTool,
  VolumeX,
  MessageCircle,
  Sliders,
  Check,
  Moon,
  Sun,
  Palette,
  FileText,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { getStoredTheme, setAppTheme, AppTheme } from '../lib/theme';

interface SettingsViewProps {
  currentUser: UserProfile;
  onBack: () => void;
  onLogout?: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

type SettingsSection =
  | 'main'
  | 'your_account'
  | 'account_info'
  | 'username_edit'
  | 'phone_edit'
  | 'country_select'
  | 'profile_label'
  | 'change_password'
  | 'download_data'
  | 'deactivate_account'
  | 'security_access'
  | 'security_details'
  | 'apps_sessions'
  | 'delegate'
  | 'privacy_security'
  | 'data_sharing'
  | 'audience_tags'
  | 'mute_block'
  | 'notifications'
  | 'notif_filters'
  | 'notif_preferences'
  | 'accessibility_display'
  | 'additional_resources';

const COUNTRIES = [
  'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Anguila',
  'Antigua y Barbuda', 'Antártida', 'Arabia Saudita', 'Argelia', 'Argentina',
  'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaiyán', 'Bahamas',
  'Bangladés', 'Barbados', 'Baréin', 'Bélgica', 'Belice', 'Benín',
  'Bermudas', 'Bielorrusia', 'Bolivia', 'Bosnia y Herzegovina', 'Botsuana',
  'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Bután',
  'Cabo Verde', 'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad',
  'Chile', 'China', 'Chipre', 'Colombia', 'Comoras', 'Corea del Sur',
  'Costa de Marfil', 'Costa Rica', 'Croacia', 'Cuba', 'Dinamarca',
  'Dominica', 'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos',
  'España', 'Estados Unidos', 'Estonia', 'Filipinas', 'Finlandia',
  'Francia', 'Grecia', 'Guatemala', 'Honduras', 'Italia', 'Japón',
  'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Portugal',
  'Reino Unido', 'República Dominicana', 'Uruguay', 'Venezuela',
];

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

/** Switch estilo X: pista redondeada (#2f3336 apagado / #1d9bf0 encendido) y perilla blanca. */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
      checked ? 'bg-[#1d9bf0]' : 'bg-[#2f3336]'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onBack,
  onLogout,
  onProfileUpdated,
}) => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const [sectionStack, setSectionStack] = useState<SettingsSection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  // Form states
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [phoneNumber, setPhoneNumber] = useState('+51903053478');
  const [phoneFlowStep, setPhoneFlowStep] = useState<'main' | 'new_input' | 'sms_verify'>('main');
  const [newPhoneInput, setNewPhoneInput] = useState('+51 987 654 321');
  const [smsDigits, setSmsDigits] = useState(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState('748291');
  const [smsError, setSmsError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Perú');
  const [profileLabel, setProfileLabel] = useState('Ninguno');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [additionalPasswordEnabled, setAdditionalPasswordEnabled] = useState(false);
  const [identityVerificationEnabled, setIdentityVerificationEnabled] = useState(false);
  const [adsPersonalizationEnabled, setAdsPersonalizationEnabled] = useState(true);
  const [dataPersonalizationEnabled, setDataPersonalizationEnabled] = useState(true);
  const [qualityFilterEnabled, setQualityFilterEnabled] = useState(true);
  const [pushNotifsEnabled, setPushNotifsEnabled] = useState(true);
  const [emailNotifsEnabled, setEmailNotifsEnabled] = useState(false);
  const [delegateInviteEnabled, setDelegateInviteEnabled] = useState(false);
  const [activeTheme, setActiveTheme] = useState<AppTheme>(getStoredTheme());
  const [successToast, setSuccessToast] = useState('');

  const navigateTo = (sec: SettingsSection) => {
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
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleSaveUsername = () => {
    const clean = newUsername.trim().replace(/^@/, '');
    if (!clean) return;
    const updated = { ...currentUser, username: clean };
    onProfileUpdated?.(updated);
    localStorage.setItem('talma_current_user', JSON.stringify(updated));
    showToast('Nombre de usuario actualizado con éxito');
    handleBack();
  };

  const handleThemeChange = (t: AppTheme) => {
    setActiveTheme(t);
    setAppTheme(t);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-[#e7e9ea] pb-24 relative select-none">
      {/* Toast Notice */}
      {successToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1d9bf0] text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl animate-pop-in">
          {successToast}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. MAIN SETTINGS SCREEN (matches 6.jpeg) */}
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
              <span className="font-extrabold text-[19px] text-white leading-tight">
                Configuración
              </span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          {/* Search Pill */}
          <div className="p-3">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#16181c] border border-transparent focus-within:border-[#1d9bf0] focus-within:bg-black transition-all">
              <Search className="w-4 h-4 text-[#71767b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Configuración de búsqueda"
                className="bg-transparent border-none outline-none text-[15px] text-white placeholder-[#71767b] w-full"
              />
            </div>
          </div>

          {/* Main List Items (matching 6.jpeg) */}
          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            {/* 1. Tu cuenta */}
            <div
              onClick={() => navigateTo('your_account')}
              className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <User className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Tu cuenta</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Consulta la información de tu cuenta, descarga un archivo con tus datos u obtén más información acerca de las opciones de desactivación de la cuenta.
                </p>
              </div>
            </div>

            {/* 2. Seguridad y acceso a la cuenta */}
            <div
              onClick={() => navigateTo('security_access')}
              className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <Lock className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Seguridad y acceso a la cuenta</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Administra la seguridad de tu cuenta y lleva un control de su uso, incluidas las apps que conectaste a ella.
                </p>
              </div>
            </div>

            {/* 3. Privacidad y seguridad */}
            <div
              onClick={() => navigateTo('privacy_security')}
              className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Privacidad y seguridad</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Administra qué información ves y compartes en Talma.
                </p>
              </div>
            </div>

            {/* 4. Notificaciones */}
            <div
              onClick={() => navigateTo('notifications')}
              className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <Bell className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Notificaciones</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Selecciona los tipos de notificaciones que quieres recibir sobre tus actividades, intereses y recomendaciones.
                </p>
              </div>
            </div>

            {/* 5. Accesibilidad, pantalla e idiomas */}
            <div
              onClick={() => navigateTo('accessibility_display')}
              className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <Palette className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Accesibilidad, pantalla e idiomas</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Administra cómo ves el contenido de Talma y elige tu tema favorito.
                </p>
              </div>
            </div>

            {/* 6. Recursos adicionales */}
            <div
              onClick={() => navigateTo('additional_resources')}
              className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <LinkIcon className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Recursos adicionales</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Consulta otros lugares para obtener más información útil sobre los productos y servicios de Talma.
                </p>
              </div>
            </div>
          </div>

          {/* Version string footer */}
          <div className="py-8 text-center text-xs text-[#71767b] tracking-wider">
            12.35.0-prod.01
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TU CUENTA (matches WhatsApp 2131231232026-10-18 at 5.58.26 PM.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'your_account' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Tu cuenta</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Consulta la información de tu cuenta, descarga un archivo con tus datos u obtén más información acerca de las opciones de desactivación de la cuenta.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            <div onClick={() => navigateTo('account_info')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <User className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Información de la cuenta</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Consulta la información de tu cuenta, como el número de teléfono y la dirección de correo electrónico.
                </p>
              </div>
            </div>

            <div onClick={() => navigateTo('change_password')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <Lock className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Cambia tu contraseña</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">Cambia tu contraseña en cualquier momento.</p>
              </div>
            </div>

            <div onClick={() => navigateTo('download_data')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <Download className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Descarga un archivo con tus datos</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">Hazte una idea del tipo de información que se almacena de tu cuenta.</p>
              </div>
            </div>

            <div onClick={() => navigateTo('deactivate_account')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <HeartCrack className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Desactivar tu cuenta</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">Averigua cómo puedes desactivar tu cuenta.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. INFORMACIÓN DE LA CUENTA (matches qweqwe.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'account_info' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Información de la cuenta</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            {/* Nombre de usuario */}
            <div onClick={() => navigateTo('username_edit')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <span className="text-xl text-[#71767b] font-mono shrink-0">@</span>
              <div className="flex-1">
                <span className="text-xs text-[#71767b]">Nombre de usuario</span>
                <p className="text-[15px] font-bold text-white">@{currentUser.username}</p>
              </div>
            </div>

            {/* Teléfono */}
            <div onClick={() => navigateTo('phone_edit')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <Phone className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-[#71767b]">Teléfono</span>
                <p className="text-[15px] font-bold text-white">{phoneNumber}</p>
              </div>
            </div>

            {/* Correo electrónico */}
            <div className="flex items-start gap-4 p-4">
              <Mail className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-[#71767b]">Correo electrónico</span>
                <p className="text-[15px] font-bold text-white">{currentUser.email || 'dreftian@hotmail.com'}</p>
              </div>
            </div>

            {/* País */}
            <div onClick={() => navigateTo('country_select')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <Globe className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-[#71767b]">País</span>
                <p className="text-[15px] font-bold text-white">{selectedCountry}</p>
                <p className="text-xs text-[#71767b] mt-0.5">
                  Selecciona el país en el que vives.{' '}
                  <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
                </p>
              </div>
            </div>

            {/* Automatización */}
            <div className="flex items-start gap-4 p-4">
              <Bot className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-[#71767b]">Automatización</span>
                <p className="text-[13px] text-[#71767b]">Administra tu cuenta automatizada.</p>
              </div>
            </div>

            {/* Etiqueta de perfil */}
            <div onClick={() => navigateTo('profile_label')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <Smile className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-[#71767b]">Etiqueta de perfil</span>
                <p className="text-[15px] font-bold text-white">{profileLabel}</p>
              </div>
            </div>

            {/* Cerrar sesión */}
            <div
              onClick={onLogout}
              className="flex items-center gap-4 p-4 hover:bg-red-500/10 cursor-pointer transition-colors group"
            >
              <LogOut className="w-5 h-5 text-[#f4212e] shrink-0" />
              <span className="text-[16px] font-bold text-[#f4212e]">Cerrar sesión</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. EDITAR NOMBRE DE USUARIO (matches WhatsApp Image 2026-11234123120-18 at 5.58.27 PM.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'username_edit' && (
        <div className="flex flex-col min-h-screen">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
            <div className="flex items-center gap-6">
              <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex flex-col">
                <span className="font-extrabold text-[19px] text-white leading-tight">Nombre de usuario</span>
                <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Actual username box */}
            <div className="relative border border-[#2f3336] rounded-xl px-4 pt-4 pb-2 bg-transparent">
              <label className="absolute -top-2.5 left-3 bg-black px-1.5 text-xs text-[#71767b]">
                Actual
              </label>
              <span className="text-[16px] text-[#71767b]">@{currentUser.username}</span>
            </div>

            {/* Nuevo username box */}
            <div className="relative border border-[#1d9bf0] rounded-xl px-4 pt-4 pb-2 bg-transparent">
              <label className="absolute -top-2.5 left-3 bg-black px-1.5 text-xs text-[#1d9bf0]">
                Nuevo
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[16px] text-[#71767b]">@</span>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[16px] text-white"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Bottom "Listo" pill button */}
          <div className="mt-auto p-4 flex justify-end">
            <button
              onClick={handleSaveUsername}
              className="px-6 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-[15px] rounded-full transition-colors cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TELÉFONO (matches WhatsApp Image 2026-10-18 at 5.58.26 qwe.jpeg & 12312354.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'phone_edit' && (
        <div className="flex flex-col flex-1">
          {phoneFlowStep === 'main' ? (
            <>
              <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
                <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex flex-col">
                  <span className="font-extrabold text-[19px] text-white leading-tight">Teléfono</span>
                  <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-[#2f3336]/40">
                <div className="flex items-start gap-4 p-4">
                  <Phone className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-[#71767b]">Teléfono actual</span>
                    <p className="text-[15px] font-bold text-white">{phoneNumber || 'Sin asignar'}</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setPhoneFlowStep('new_input');
                    setSmsDigits(['', '', '', '', '', '']);
                    setSmsError('');
                  }}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <PenTool className="w-5 h-5 text-[#71767b] shrink-0" />
                  <span className="text-[15px] font-semibold text-white">Actualizar número de teléfono</span>
                </div>

                <div
                  onClick={() => {
                    setPhoneNumber('');
                    showToast('Número de teléfono eliminado');
                  }}
                  className="flex items-center gap-4 p-4 hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <span className="text-red-500 font-semibold text-[15px] pl-9">
                    Eliminar número de teléfono
                  </span>
                </div>
              </div>
            </>
          ) : phoneFlowStep === 'new_input' ? (
            <>
              {/* Step 1: Input new phone */}
              <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setPhoneFlowStep('main')}
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <span className="font-extrabold text-[19px] text-white">Actualizar teléfono</span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5 max-w-lg mx-auto w-full">
                <div>
                  <h3 className="font-bold text-xl text-white">Introduce tu nuevo número</h3>
                  <p className="text-xs text-[#71767b] mt-1.5 leading-relaxed">
                    Te enviaremos un código de verificación SMS para asegurarnos de que el número te pertenece.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#71767b] font-medium">Número de teléfono</label>
                  <input
                    type="tel"
                    value={newPhoneInput}
                    onChange={(e) => setNewPhoneInput(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full px-4 py-3 bg-[#16181c] border border-[#2f3336] rounded-xl text-white text-base focus:border-[#1d9bf0] focus:outline-hidden"
                  />
                </div>

                <button
                  onClick={() => {
                    if (newPhoneInput.trim().length < 6) {
                      alert('Introduce un número de teléfono válido.');
                      return;
                    }
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setDemoCode(code);
                    setPhoneFlowStep('sms_verify');
                    setSmsDigits(['', '', '', '', '', '']);
                    setSmsError('');
                  }}
                  className="w-full mt-2 py-3 bg-white hover:bg-white/90 text-black font-extrabold rounded-full transition-transform active:scale-98 cursor-pointer text-sm shadow-md"
                >
                  Siguiente
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: SMS Verification Code Screen (EXACT match with reference 12312354.jpeg) */}
              <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setPhoneFlowStep('new_input')}
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <span className="font-extrabold text-[19px] text-white">Actualizar teléfono</span>
                </div>
              </div>

              <div className="flex flex-col flex-1 max-w-lg mx-auto w-full px-8 pt-8 pb-6">
                <div className="flex flex-col gap-3">
                  <h3 className="font-extrabold text-[28px] leading-tight text-white">Te enviamos un código</h3>
                  <p className="text-[15px] text-[#71767b] leading-normal">
                    Introduce el código de verificación enviado a{' '}
                    <span className="text-[#e7e9ea]">{newPhoneInput}</span>.
                  </p>
                </div>

                {/* Código de verificación (matches 12312354.jpeg) */}
                <div className="mt-8 flex flex-col gap-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={smsDigits.join('')}
                    onChange={(e) => {
                      setSmsDigits(e.target.value.replace(/\D/g, '').slice(0, 6).split(''));
                      setSmsError('');
                    }}
                    placeholder="Introduce el código de verificación"
                    className="w-full px-4 py-3.5 bg-black border-2 border-[#1d9bf0] rounded-md text-white text-[17px] placeholder-[#71767b] outline-none transition-colors"
                  />

                  {smsError && (
                    <p className="text-xs text-red-500 font-semibold">{smsError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setDemoCode(code);
                      setSmsDigits([]);
                      showToast('Nuevo código reenviado');
                    }}
                    className="self-start text-[15px] text-[#1d9bf0] hover:underline font-medium cursor-pointer"
                  >
                    ¿No recibiste un código?
                  </button>

                  {/* Ayuda de demo: permite completar el flujo sin un SMS real */}
                  <button
                    type="button"
                    onClick={() => {
                      setSmsDigits(demoCode.split(''));
                      setSmsError('');
                    }}
                    className="self-start text-[11px] text-[#71767b] hover:text-[#e7e9ea] transition-colors cursor-pointer"
                  >
                    💬 Código de prueba: <span className="tracking-widest">{demoCode}</span> · Rellenar
                  </button>
                </div>

                <div className="mt-auto pt-8 flex justify-end">
                  <button
                    onClick={() => {
                      const entered = smsDigits.join('');
                      if (entered.length < 6) {
                        setSmsError('Introduce los 6 dígitos del código.');
                        return;
                      }
                      if (entered !== demoCode) {
                        setSmsError('El código introducido no es correcto. Inténtalo de nuevo.');
                        return;
                      }

                      // Success!
                      setPhoneNumber(newPhoneInput);
                      setPhoneFlowStep('main');
                      showToast('Número de teléfono verificado y actualizado');
                    }}
                    disabled={smsDigits.length < 6}
                    className="px-6 py-2.5 bg-[#333639] text-[#71767b] font-bold rounded-full text-[15px] cursor-not-allowed disabled:cursor-not-allowed transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. PAÍS (matches WhatsApp Image 202333346-10-18 at 5.58.27 PM.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'country_select' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">País</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#16181c] border border-transparent focus-within:border-[#1d9bf0] transition-all">
              <Search className="w-4 h-4 text-[#71767b]" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Buscar países"
                className="bg-transparent border-none outline-none text-[15px] text-white placeholder-[#71767b] w-full"
              />
            </div>
          </div>

          <div className="flex flex-col divide-y divide-[#2f3336]/30 max-h-[70vh] overflow-y-auto">
            {COUNTRIES.filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
              <div
                key={c}
                onClick={() => {
                  setSelectedCountry(c);
                  showToast(`País establecido en ${c}`);
                  handleBack();
                }}
                className="px-4 py-3.5 hover:bg-white/[0.04] cursor-pointer flex items-center justify-between text-[15px]"
              >
                <span className={c === selectedCountry ? 'font-bold text-[#1d9bf0]' : 'text-white'}>
                  {c}
                </span>
                {c === selectedCountry && <Check className="w-4 h-4 text-[#1d9bf0]" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. ETIQUETA DE PERFIL (matches rdsfsdf.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'profile_label' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Agregar etiqueta al perfil</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Esta etiqueta sirve para que las personas en Talma no se confundan con tu cuenta, ya que indica que tu cuenta no está afiliada con el tema del perfil.{' '}
            <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
          </p>

          <div className="p-4 flex flex-col gap-2">
            <span className="text-xs text-[#71767b]">Etiqueta de perfil</span>
            <div className="flex items-center gap-3">
              {['Ninguno', 'Cuenta de parodia', 'Cuenta de fans', 'Comentario'].map((lbl) => (
                <button
                  key={lbl}
                  onClick={() => {
                    setProfileLabel(lbl);
                    showToast(`Etiqueta: ${lbl}`);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    profileLabel === lbl ? 'bg-[#1d9bf0] text-white' : 'bg-[#16181c] text-[#71767b]'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. SEGURIDAD Y ACCESO A LA CUENTA (matches 21412421.jpeg, 224.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'security_access' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Seguridad y acceso a la cuenta</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Administra la seguridad de tu cuenta y lleva un control de su uso, incluidas las apps que conectaste a ella.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            {/* Seguridad */}
            <div onClick={() => navigateTo('security_details')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <Lock className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Seguridad</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Administra la seguridad de tu cuenta, autenticación en dos fases y claves de acceso.
                </p>
              </div>
            </div>

            {/* Apps y sesiones */}
            <div onClick={() => navigateTo('apps_sessions')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <Smartphone className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Apps y sesiones</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Consulta la información sobre cuándo iniciaste sesión en tu cuenta y las aplicaciones que conectaste a ella.
                </p>
              </div>
            </div>

            {/* Delega */}
            <div onClick={() => navigateTo('delegate')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
              <Users className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Delega</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                  Compartir una cuenta con personas que tienen roles delegados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. SUBMENU SEGURIDAD (matches 224.jpeg & WhatsApp Image 55124...) */}
      {/* ========================================================= */}
      {currentSection === 'security_details' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Seguridad</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Administra la seguridad de tu cuenta.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            {/* 2FA */}
            <div className="p-4 flex flex-col gap-1.5">
              <h3 className="font-bold text-[16px] text-white">Autenticación en dos fases</h3>
              <p className="text-[13px] text-[#71767b] leading-normal">
                Protege tu cuenta de accesos no autorizados con un segundo método de autenticación, además de tu contraseña de Talma. Puedes elegir entre un mensaje de texto, una app de autenticación o una clave de seguridad.{' '}
                <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[15px] font-semibold text-white">Autenticación en dos fases</span>
                <ToggleSwitch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} label="Autenticación en dos fases" />
              </div>
            </div>

            {/* Verificación de documento de identidad */}
            <div className="p-4 flex flex-col gap-1.5">
              <h3 className="font-bold text-[16px] text-white">Verificación de documento de identidad</h3>
              <p className="text-[13px] text-[#71767b] leading-normal">
                Carga un documento de identidad aprobado para confirmar la autenticidad de tu cuenta. Tu información solo se usará para validar tu identidad y se procesará de forma segura.{' '}
                <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[15px] font-semibold text-white">Verificación de documento de identidad</span>
                <ToggleSwitch
                  checked={identityVerificationEnabled}
                  onChange={setIdentityVerificationEnabled}
                  label="Verificación de documento de identidad"
                />
              </div>
            </div>

            {/* Protección con contraseña adicional */}
            <div className="p-4 flex flex-col gap-2">
              <h3 className="font-bold text-[16px] text-white">Protección con contraseña adicional</h3>
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <span className="text-[15px] font-semibold text-white block">
                    Protección de restablecimiento de contraseña
                  </span>
                  <p className="text-[13px] text-[#71767b] mt-0.5">
                    Se requiere una confirmación adicional de tu correo electrónico o número de teléfono para permitir restablecer la contraseña.
                  </p>
                </div>
                <ToggleSwitch
                  checked={additionalPasswordEnabled}
                  onChange={setAdditionalPasswordEnabled}
                  label="Protección de restablecimiento de contraseña"
                />
              </div>
            </div>

            {/* Claves de acceso */}
            <div className="p-4 flex flex-col gap-1">
              <h3 className="font-bold text-[16px] text-white">Administrar claves de acceso</h3>
              <p className="text-[13px] text-[#71767b]">
                Las claves de acceso ofrecen una protección adicional que puede estar vinculada a tus datos biométricos.{' '}
                <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. APPS Y SESIONES (matches 21412421.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'apps_sessions' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Apps y sesiones</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Consulta la información sobre cuándo iniciaste sesión en tu cuenta y las aplicaciones que conectaste a ella.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer">
              <span className="text-[15px] font-bold text-white">Aplicaciones conectadas</span>
              <ChevronRight className="w-5 h-5 text-[#71767b]" />
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer">
              <div>
                <span className="text-[15px] font-bold text-white block">Sesiones activas</span>
                <span className="text-xs text-[#71767b]">Dispositivo actual: Lima, Perú (Activo ahora)</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71767b]" />
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer">
              <span className="text-[15px] font-bold text-white">Historial de acceso a la cuenta</span>
              <ChevronRight className="w-5 h-5 text-[#71767b]" />
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer">
              <span className="text-[15px] font-bold text-white">Dispositivos y aplicaciones que iniciaron sesión</span>
              <ChevronRight className="w-5 h-5 text-[#71767b]" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. DELEGA (matches WhatsApp Image 2026-10-18 at 5.54448.28 PM.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'delegate' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Delega</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Compartir una cuenta con personas que tienen roles delegados.
          </p>

          <div className="p-4 flex items-center justify-between border-b border-[#2f3336]/40">
            <div className="flex-1 pr-4">
              <span className="text-[15px] font-bold text-white block">Permitir que otros te inviten a su cuenta</span>
              <p className="text-[13px] text-[#71767b] mt-0.5">
                Cuando esta opción está activada, la gente puede invitarte a compartir su cuenta.{' '}
                <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
              </p>
            </div>
            <ToggleSwitch checked={delegateInviteEnabled} onChange={setDelegateInviteEnabled} label="Permitir que otros te inviten a su cuenta" />
          </div>

          <div className="p-4">
            <h4 className="font-bold text-[16px] text-white mb-2">Tus delegaciones</h4>
            <div className="flex flex-col divide-y divide-[#2f3336]/40">
              <div className="flex items-center justify-between py-3 hover:bg-white/[0.04] cursor-pointer">
                <span className="text-[15px] text-white">Cuentas que te han delegado</span>
                <ChevronRight className="w-5 h-5 text-[#71767b]" />
              </div>
              <div className="flex items-center justify-between py-3 hover:bg-white/[0.04] cursor-pointer">
                <span className="text-[15px] text-white">Miembros en los que has delegado</span>
                <ChevronRight className="w-5 h-5 text-[#71767b]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. PRIVACIDAD Y SEGURIDAD (matches asdad.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'privacy_security' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Privacidad y seguridad</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <div className="p-4 border-b border-[#2f3336]/40">
            <span className="font-bold text-[16px] text-white">Tu actividad de Talma</span>
          </div>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            <div className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <Users className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Audiencia y etiquetas</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Administra qué información permites que vean otras personas en Talma.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <PenTool className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Tus posts</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Administra la información asociada a tus posts.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <Eye className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Contenido que ves</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Decida qué ver en Talma en función de sus preferencias.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <VolumeX className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Silenciar y bloquear</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Administra las cuentas, palabras y notificaciones que silenciaste o bloqueaste.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <MessageCircle className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Chats</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Administra quiénes pueden enviarte mensajes directamente.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <Search className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Visibilidad y contactos</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Controla tu configuración de visibilidad y administra los contactos que hayas importado.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <Globe className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Acerca de tu cuenta</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Administra la ubicación asociada a tu cuenta.</p>
              </div>
            </div>
          </div>

          {/* Intercambio y personalización de datos (matches asdad.jpeg) */}
          <div className="p-4 border-y border-[#2f3336]/40">
            <span className="font-bold text-[16px] text-white">Intercambio y personalización de datos</span>
          </div>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            <div
              onClick={() => navigateTo('data_sharing')}
              className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <Megaphone className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Anuncios personalizados</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Administra cómo se usan tus datos para personalizar los anuncios que ves en Talma.</p>
              </div>
            </div>

            <div
              onClick={() => navigateTo('data_sharing')}
              className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <Database className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-white">Personalización de datos</h3>
                <p className="text-xs text-[#71767b] mt-0.5">Controla los datos que Talma usa para personalizar tu experiencia y tus recomendaciones.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12b. INTERCAMBIO Y PERSONALIZACIÓN DE DATOS (matches asdad.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'data_sharing' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Intercambio y personalización de datos</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Controla cómo Talma usa tus datos para personalizar tu experiencia y los anuncios que ves.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            <div className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-[15px] font-bold text-white block">Anuncios personalizados</span>
                <p className="text-[13px] text-[#71767b] mt-0.5">
                  Usa tu actividad e intereses para mostrarte anuncios más relevantes.{' '}
                  <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
                </p>
              </div>
              <ToggleSwitch checked={adsPersonalizationEnabled} onChange={setAdsPersonalizationEnabled} label="Anuncios personalizados" />
            </div>

            <div className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-[15px] font-bold text-white block">Personalización de datos</span>
                <p className="text-[13px] text-[#71767b] mt-0.5">
                  Permite que Talma use los datos de tu actividad para personalizar recomendaciones y contenido.{' '}
                  <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
                </p>
              </div>
              <ToggleSwitch checked={dataPersonalizationEnabled} onChange={setDataPersonalizationEnabled} label="Personalización de datos" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. NOTIFICACIONES (matches 112.jpeg, WhatsAp111p..., WhatsApp Ima22ge...) */}
      {/* ========================================================= */}
      {currentSection === 'notifications' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Notificaciones</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Selecciona los tipos de notificaciones que quieres recibir sobre tus actividades, intereses y recomendaciones.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            <div onClick={() => navigateTo('notif_filters')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <Sliders className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Filtros</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">Elige las notificaciones que quieres ver, y las que no.</p>
              </div>
            </div>

            <div onClick={() => navigateTo('notif_preferences')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer">
              <Bell className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[16px] text-white leading-tight">Preferencias</h3>
                <p className="text-[13px] text-[#71767b] mt-1 leading-normal">Selecciona tus preferencias por tipo de notificación.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones > Filtros (matches WhatsApp Ima22ge...) */}
      {currentSection === 'notif_filters' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Filtros</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Elige las notificaciones que quieres ver, y las que no.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1 pr-4">
                <h4 className="font-bold text-[15px] text-white">Filtro de calidad</h4>
                <p className="text-xs text-[#71767b] mt-0.5">
                  Filtra el contenido de baja calidad de tus notificaciones. Esta opción no filtrará las notificaciones de las personas que sigues ni de las cuentas con las que hayas interactuado recientemente.{' '}
                  <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
                </p>
              </div>
              <ToggleSwitch checked={qualityFilterEnabled} onChange={setQualityFilterEnabled} label="Filtro de calidad" />
            </div>

            <div className="p-4 hover:bg-white/[0.04] cursor-pointer">
              <span className="font-semibold text-[15px] text-white">Notificaciones silenciadas</span>
            </div>

            <div className="p-4 hover:bg-white/[0.04] cursor-pointer">
              <span className="font-semibold text-[15px] text-white">Palabras silenciadas</span>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones > Preferencias (matches WhatsAp111p Image...) */}
      {currentSection === 'notif_preferences' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Preferencias</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
            Selecciona tus preferencias por tipo de notificación.{' '}
            <span className="text-[#1d9bf0] cursor-pointer">Más información</span>
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-[#71767b]" />
                <span className="text-[15px] font-bold text-white">Notificaciones push</span>
              </div>
              <ToggleSwitch checked={pushNotifsEnabled} onChange={setPushNotifsEnabled} label="Notificaciones push" />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-[#71767b]" />
                <span className="text-[15px] font-bold text-white">Notificaciones de correo electrónico</span>
              </div>
              <ToggleSwitch checked={emailNotifsEnabled} onChange={setEmailNotifsEnabled} label="Notificaciones de correo electrónico" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 14. ACCESIBILIDAD, PANTALLA E IDIOMAS (Theme Switcher) */}
      {/* ========================================================= */}
      {currentSection === 'accessibility_display' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Accesibilidad, pantalla e idiomas</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <div className="p-4">
            <h4 className="font-bold text-[17px] text-white mb-2">Tema y aspecto</h4>
            <p className="text-xs text-[#71767b] mb-4">
              Personaliza el fondo visual de Talma según tus preferencias de lectura y confort visual.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Oscuro */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  activeTheme === 'dark'
                    ? 'border-[#1d9bf0] bg-[#16181c]'
                    : 'border-[#2f3336] bg-black hover:bg-[#16181c]'
                }`}
              >
                <Moon className="w-6 h-6 text-white" />
                <span className="font-bold text-sm text-white">Oscuro</span>
                <span className="text-[11px] text-[#71767b]">Negro puro (#000)</span>
              </button>

              {/* Noche clara */}
              <button
                onClick={() => handleThemeChange('dim')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  activeTheme === 'dim'
                    ? 'border-[#1d9bf0] bg-[#192734]'
                    : 'border-[#2f3336] bg-[#15202b] hover:bg-[#192734]'
                }`}
              >
                <Palette className="w-6 h-6 text-[#8899a6]" />
                <span className="font-bold text-sm text-white">Noche clara</span>
                <span className="text-[11px] text-[#8899a6]">Azul oscuro (#15202b)</span>
              </button>

              {/* Luz */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  activeTheme === 'light'
                    ? 'border-[#1d9bf0] bg-gray-100'
                    : 'border-[#2f3336] bg-white text-black hover:bg-gray-100'
                }`}
              >
                <Sun className="w-6 h-6 text-[#0f1419]" />
                <span className="font-bold text-sm text-[#0f1419]">Luz</span>
                <span className="text-[11px] text-[#536471]">Blanco (#fff)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 15. RECURSOS ADICIONALES (matches 112234.jpeg) */}
      {/* ========================================================= */}
      {currentSection === 'additional_resources' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Recursos adicionales</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <p className="px-4 py-3 text-xs text-[#71767b] border-b border-[#2f3336]/40">
            Version 12.35.0-prod.01
          </p>

          <div className="p-4 border-b border-[#2f3336]/40">
            <h4 className="font-bold text-[17px] text-white mb-3">Legal</h4>
            <div className="flex flex-col gap-3 text-[15px] text-[#e7e9ea]">
              <span className="hover:underline cursor-pointer">Información sobre anuncios</span>
              <span className="hover:underline cursor-pointer">Uso de cookies</span>
              <span className="hover:underline cursor-pointer">Política de privacidad</span>
              <span className="hover:underline cursor-pointer">Términos de servicio</span>
              <span className="hover:underline cursor-pointer">Avisos legales</span>
            </div>
          </div>

          <div className="p-4">
            <h4 className="font-bold text-[17px] text-white mb-3">Varios</h4>
            <div className="flex flex-col gap-3 text-[15px] text-[#e7e9ea]">
              <span className="hover:underline cursor-pointer">Sobre nosotros</span>
              <span className="hover:underline cursor-pointer">Accesibilidad</span>
              <span className="hover:underline cursor-pointer">Publicidad</span>
              <span className="hover:underline cursor-pointer">Blog</span>
              <span className="hover:underline cursor-pointer">Recursos para marcas</span>
              <span className="hover:underline cursor-pointer">Empleos</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 16. CAMBIAR CONTRASEÑA */}
      {/* ========================================================= */}
      {currentSection === 'change_password' && (
        <div className="flex flex-col min-h-screen">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Cambia tu contraseña</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <input
              type="password"
              placeholder="Contraseña actual"
              className="p-3.5 bg-black border border-[#2f3336] focus:border-[#1d9bf0] rounded-xl text-white outline-none"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="p-3.5 bg-black border border-[#2f3336] focus:border-[#1d9bf0] rounded-xl text-white outline-none"
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              className="p-3.5 bg-black border border-[#2f3336] focus:border-[#1d9bf0] rounded-xl text-white outline-none"
            />
            <button
              onClick={() => {
                showToast('Contraseña cambiada con éxito');
                handleBack();
              }}
              className="mt-4 py-2.5 bg-white hover:bg-white/90 text-black font-bold rounded-full cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 17. DESCARGAR DATOS */}
      {/* ========================================================= */}
      {currentSection === 'download_data' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Descarga tus datos</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center text-center gap-4">
            <Download className="w-12 h-12 text-[#1d9bf0]" />
            <h3 className="font-bold text-xl text-white">Solicita tu archivo de datos</h3>
            <p className="text-sm text-[#71767b] max-w-sm">
              Puedes solicitar un archivo ZIP o JSON con el historial de tus publicaciones, perfil, fotos y mensajes en Talma.
            </p>
            <button
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentUser, null, 2));
                const a = document.createElement('a');
                a.href = dataStr;
                a.download = `talma_data_${currentUser.username}.json`;
                a.click();
                showToast('Descarga iniciada');
              }}
              className="px-6 py-2.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full cursor-pointer"
            >
              Descargar archivo JSON
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 18. DESACTIVAR CUENTA */}
      {/* ========================================================= */}
      {currentSection === 'deactivate_account' && (
        <div className="flex flex-col">
          <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center gap-6 px-4 h-[53px]">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] text-white leading-tight">Desactivar cuenta</span>
              <span className="text-xs text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar_url}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-[#2f3336]"
              />
              <div>
                <span className="font-bold text-white block">{currentUser.display_name}</span>
                <span className="text-sm text-[#71767b]">@{currentUser.username}</span>
              </div>
            </div>

            <h4 className="font-bold text-[17px] text-white mt-2">Esta acción desactivará tu cuenta</h4>
            <p className="text-sm text-[#71767b] leading-normal">
              Estás a punto de iniciar el proceso de desactivación de tu cuenta de Talma. Tu nombre visible, tu @usuario y tu perfil público dejarán de ser visibles.
            </p>

            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que deseas desactivar tu cuenta de Talma?')) {
                  onLogout?.();
                }
              }}
              className="mt-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full cursor-pointer"
            >
              Desactivar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
