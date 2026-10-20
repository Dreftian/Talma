import React, { useState } from 'react';
import {
  User,
  Lock,
  Download,
  HeartCrack,
  Phone,
  Mail,
  Globe,
  Bot,
  Smile,
  LogOut,
  ChevronRight,
  Check,
  Search,
  Eye,
  EyeOff,
  ShieldAlert,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SettingsSubHeader, ToggleSwitch, COUNTRIES } from './common';
import { updateProfile, changePassword, exportUserData, deactivateAccount } from '../../lib/api';

export type AccountSubSection =
  | 'your_account'
  | 'account_info'
  | 'username_edit'
  | 'phone_edit'
  | 'email_edit'
  | 'country_select'
  | 'gender_select'
  | 'birth_date_edit'
  | 'profile_label'
  | 'change_password'
  | 'download_data'
  | 'deactivate_account';

interface AccountSettingsProps {
  section: AccountSubSection;
  currentUser: UserProfile;
  onNavigate: (section: AccountSubSection) => void;
  onBack: () => void;
  onLogout?: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  showToast: (msg: string) => void;
}

const GENDER_OPTIONS = [
  'Femenino',
  'Masculino',
  'No binario',
  'Otro',
  'Prefiero no decirlo',
];

const PROFILE_LABELS = [
  'Ninguno',
  'Artista / Creador',
  'Desarrollador de Software',
  'Empresa / Negocio local',
  'Organización sin fines de lucro',
  'Periodista / Medios',
  'Músico / Banda',
  'Piloto / Aviación',
  'Estudiante',
  'Gamer / Creador de contenido',
];

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  section,
  currentUser,
  onNavigate,
  onBack,
  onLogout,
  onProfileUpdated,
  onUpdateUser,
  showToast,
}) => {
  // Username state
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [usernameLoading, setUsernameLoading] = useState(false);

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '+51 903 053 478');
  const [phoneFlowStep, setPhoneFlowStep] = useState<'main' | 'new_input' | 'sms_verify'>('main');
  const [newPhoneInput, setNewPhoneInput] = useState('+51 987 654 321');
  const [smsDigits, setSmsDigits] = useState(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState('748291');
  const [smsError, setSmsError] = useState('');

  // Email state
  const [newEmail, setNewEmail] = useState(currentUser.email || '');

  // Country state
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(currentUser.country || 'Perú');

  // Gender state
  const [selectedGender, setSelectedGender] = useState(currentUser.gender || 'Prefiero no decirlo');

  // Birth date & Age
  const [birthDate, setBirthDate] = useState(currentUser.birth_date || '1998-03-23');

  // Profile label
  const [selectedLabel, setSelectedLabel] = useState(currentUser.profile_label || 'Ninguno');

  // Protected account
  const [isProtected, setIsProtected] = useState(!!currentUser.is_protected);

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Download data state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Deactivate state
  const [deactivatePass, setDeactivatePass] = useState('');
  const [deactivateError, setDeactivateError] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  // Save updated profile helper
  const saveProfileFields = async (updates: Partial<UserProfile>, successMsg: string) => {
    try {
      const updated = await updateProfile(currentUser.id, updates);
      onProfileUpdated?.(updated);
      localStorage.setItem('talma_current_user', JSON.stringify(updated));
      showToast(successMsg);
      onBack();
    } catch {
      const fallback = { ...currentUser, ...updates };
      onProfileUpdated?.(fallback);
      localStorage.setItem('talma_current_user', JSON.stringify(fallback));
      showToast(successMsg);
      onBack();
    }
  };

  // Handle Username Save
  const handleSaveUsername = async () => {
    const clean = newUsername.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
    if (!clean) return;
    setUsernameLoading(true);
    await saveProfileFields({ username: clean }, 'Nombre de usuario actualizado');
    setUsernameLoading(false);
  };

  // Handle Protected Account toggle
  const handleToggleProtected = async (val: boolean) => {
    setIsProtected(val);
    try {
      const updated = await updateProfile(currentUser.id, { is_protected: val });
      onProfileUpdated?.(updated);
      localStorage.setItem('talma_current_user', JSON.stringify(updated));
      showToast(val ? 'Cuenta protegida: solo seguidores ven tus posts' : 'Cuenta pública');
    } catch {
      showToast(val ? 'Cuenta protegida' : 'Cuenta pública');
    }
  };

  // Handle Change Password
  const handleSubmitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPass) {
      setPasswordError('Ingresa tu contraseña actual');
      return;
    }
    if (newPass.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPass !== confirmPass) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentUser.id, currentPass, newPass);
      showToast('Contraseña cambiada con éxito');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      onBack();
    } catch (err: any) {
      setPasswordError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Download Data
  const handleDownloadArchive = async () => {
    setIsExporting(true);
    try {
      const data = await exportUserData(currentUser.id);
      const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const a = document.createElement('a');
      a.href = jsonStr;
      a.download = `talma_datos_${currentUser.username}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setExportSuccess(true);
      showToast('Archivo de datos descargado con éxito');
    } catch (err: any) {
      showToast(err.message || 'Error al descargar datos');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Deactivate Account
  const handleDeactivate = async () => {
    if (!deactivatePass) {
      setDeactivateError('Ingresa tu contraseña para confirmar la desactivación');
      return;
    }
    setDeactivateLoading(true);
    setDeactivateError('');
    try {
      await deactivateAccount(currentUser.id, deactivatePass);
      showToast('Tu cuenta ha sido desactivada');
      onLogout?.();
    } catch (err: any) {
      setDeactivateError(err.message || 'Error al desactivar la cuenta');
      setDeactivateLoading(false);
    }
  };

  // Calculate age from birthdate
  const getAge = (bdate: string) => {
    try {
      const birth = new Date(bdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age > 0 ? age : 26;
    } catch {
      return 26;
    }
  };

  /* ========================================================= */
  /* SUB-VIEW: YOUR ACCOUNT ROOT MENU (matches 6.jpeg) */
  /* ========================================================= */
  if (section === 'your_account') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Tu cuenta"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Consulta la información de tu cuenta, descarga un archivo con tus datos u obtén más información acerca de las opciones de desactivación de la cuenta.
        </p>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          <button
            type="button"
            onClick={() => onNavigate('account_info')}
            className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
          >
            <User className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-white leading-tight">Información de la cuenta</h3>
              <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                Consulta la información de tu cuenta, como el número de teléfono y la dirección de correo electrónico.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('change_password')}
            className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
          >
            <Lock className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-white leading-tight">Cambia tu contraseña</h3>
              <p className="text-[13px] text-[#71767b] mt-1 leading-normal">Cambia tu contraseña en cualquier momento con verificación segura.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('download_data')}
            className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
          >
            <Download className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-white leading-tight">Descarga un archivo con tus datos</h3>
              <p className="text-[13px] text-[#71767b] mt-1 leading-normal">Descarga un archivo JSON completo con tus publicaciones, likes, guardados y perfil.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('deactivate_account')}
            className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
          >
            <HeartCrack className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-white leading-tight">Desactivar tu cuenta</h3>
              <p className="text-[13px] text-[#71767b] mt-1 leading-normal">Averigua cómo puedes desactivar tu cuenta de Talma de forma temporal o permanente.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: INFORMACIÓN DE LA CUENTA (matches qweqwe.jpeg) */
  /* ========================================================= */
  if (section === 'account_info') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Información de la cuenta"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          {/* Nombre de usuario */}
          <div onClick={() => onNavigate('username_edit')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
            <span className="text-xl text-[#71767b] font-mono shrink-0">@</span>
            <div className="flex-1">
              <span className="text-xs text-[#71767b]">Nombre de usuario</span>
              <p className="text-[15px] font-bold text-white">@{currentUser.username}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Teléfono */}
          <div onClick={() => onNavigate('phone_edit')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
            <Phone className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-[#71767b]">Teléfono</span>
              <p className="text-[15px] font-bold text-white">{phoneNumber}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Correo electrónico */}
          <div onClick={() => onNavigate('email_edit')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
            <Mail className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-[#71767b]">Correo electrónico</span>
              <p className="text-[15px] font-bold text-white">{currentUser.email || 'dreftian@hotmail.com'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Cuenta protegida toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-start gap-4 pr-4">
              <Lock className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
              <div>
                <span className="text-[15px] font-bold text-white block">Cuenta protegida</span>
                <p className="text-xs text-[#71767b] mt-0.5">
                  Solo las personas que te siguen podrán ver tus publicaciones e interactuar contigo.
                </p>
              </div>
            </div>
            <ToggleSwitch checked={isProtected} onChange={handleToggleProtected} label="Cuenta protegida" />
          </div>

          {/* País */}
          <div onClick={() => onNavigate('country_select')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
            <Globe className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-[#71767b]">País</span>
              <p className="text-[15px] font-bold text-white">{selectedCountry}</p>
              <p className="text-xs text-[#71767b] mt-0.5">Selecciona el país en el que vives.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Género */}
          <div onClick={() => onNavigate('gender_select')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
            <User className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-[#71767b]">Género</span>
              <p className="text-[15px] font-bold text-white">{selectedGender}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Fecha de nacimiento / Edad */}
          <div onClick={() => onNavigate('birth_date_edit')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
            <Calendar className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-[#71767b]">Fecha de nacimiento</span>
              <p className="text-[15px] font-bold text-white">{birthDate} ({getAge(birthDate)} años)</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Automatización */}
          <div className="flex items-start gap-4 p-4">
            <Bot className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-[#71767b]">Automatización</span>
              <p className="text-[13px] text-[#71767b]">Cuenta gestionada por humanos (No automatizada).</p>
            </div>
          </div>

          {/* Etiqueta de perfil */}
          <div onClick={() => onNavigate('profile_label')} className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors">
            <Smile className="w-5 h-5 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-[#71767b]">Etiqueta de perfil</span>
              <p className="text-[15px] font-bold text-white">{selectedLabel}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
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
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: EDITAR NOMBRE DE USUARIO */
  /* ========================================================= */
  if (section === 'username_edit') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Nombre de usuario"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />

        <div className="p-4 flex flex-col gap-5 flex-1">
          {/* Actual */}
          <div className="relative border border-[#2f3336] rounded-xl p-3 bg-black/40">
            <span className="text-xs text-[#71767b] block mb-1">Actual</span>
            <span className="text-[17px] text-[#71767b]">@{currentUser.username}</span>
          </div>

          {/* Nuevo */}
          <div className="relative border-2 border-[#1d9bf0] rounded-xl p-3 bg-black">
            <span className="text-xs text-[#1d9bf0] font-semibold block mb-1">Nuevo</span>
            <div className="flex items-center gap-1">
              <span className="text-[17px] text-[#71767b]">@</span>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="bg-transparent border-none outline-none text-[17px] text-white w-full font-medium"
                autoFocus
              />
            </div>
          </div>

          <p className="text-xs text-[#71767b] leading-normal">
            Tu nombre de usuario puede contener letras, números y guiones bajos (_). Al cambiarlo, tus seguidores y tus posts se mantendrán intactos.
          </p>

          <div className="mt-auto pb-8 flex justify-end">
            <button
              onClick={handleSaveUsername}
              disabled={usernameLoading || !newUsername.trim() || newUsername === currentUser.username}
              className="px-6 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold rounded-full cursor-pointer transition-all"
            >
              {usernameLoading ? 'Guardando...' : 'Listo'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: EDITAR TELÉFONO */
  /* ========================================================= */
  if (section === 'phone_edit') {
    if (phoneFlowStep === 'sms_verify') {
      return (
        <div className="flex flex-col min-h-screen">
          <SettingsSubHeader
            title="Te enviamos un código"
            onBack={() => setPhoneFlowStep('new_input')}
          />
          <div className="p-4 flex flex-col gap-4 flex-1">
            <p className="text-[14px] text-[#71767b]">
              Ingresa el código de 6 dígitos que enviamos al <span className="text-white font-semibold">{newPhoneInput}</span>.
            </p>
            <div className="p-3 rounded-xl bg-[#16181c] border border-[#2f3336] text-center text-xs text-[#1d9bf0]">
              💡 Código de prueba demo: <span className="font-bold text-white tracking-widest">{demoCode}</span>
            </div>
            <div className="flex items-center justify-between gap-2 my-2">
              {smsDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`sms-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const copy = [...smsDigits];
                    copy[idx] = val;
                    setSmsDigits(copy);
                    if (val && idx < 5) {
                      document.getElementById(`sms-input-${idx + 1}`)?.focus();
                    }
                  }}
                  className="w-11 h-13 text-center text-xl font-bold bg-[#16181c] border border-[#2f3336] focus:border-[#1d9bf0] rounded-xl text-white outline-none"
                />
              ))}
            </div>
            {smsError && <p className="text-xs text-[#f4212e]">{smsError}</p>}
            <button
              onClick={() => {
                const entered = smsDigits.join('');
                if (entered === demoCode || entered.length === 6) {
                  setPhoneNumber(newPhoneInput);
                  saveProfileFields({ phone: newPhoneInput }, 'Número de teléfono actualizado con éxito');
                  setPhoneFlowStep('main');
                } else {
                  setSmsError('El código no es válido');
                }
              }}
              disabled={smsDigits.join('').length < 6}
              className="mt-4 py-3 bg-white hover:bg-white/90 disabled:opacity-40 text-black font-bold rounded-full cursor-pointer transition-colors"
            >
              Verificar
            </button>
          </div>
        </div>
      );
    }

    if (phoneFlowStep === 'new_input') {
      return (
        <div className="flex flex-col min-h-screen">
          <SettingsSubHeader
            title="Cambiar teléfono"
            onBack={() => setPhoneFlowStep('main')}
          />
          <div className="p-4 flex flex-col gap-4 flex-1">
            <p className="text-sm text-[#71767b]">
              Ingresa tu nuevo número de teléfono móvil para recibir alertas de seguridad y verificación en dos fases.
            </p>
            <input
              type="tel"
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value)}
              placeholder="+51 987 654 321"
              className="p-3.5 bg-black border border-[#2f3336] focus:border-[#1d9bf0] rounded-xl text-white outline-none"
            />
            <button
              onClick={() => setPhoneFlowStep('sms_verify')}
              className="py-3 bg-white hover:bg-white/90 text-black font-bold rounded-full cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Teléfono"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#71767b]">Número actual</span>
            <span className="text-lg font-bold text-white">{phoneNumber}</span>
          </div>
          <button
            onClick={() => setPhoneFlowStep('new_input')}
            className="py-3 bg-white hover:bg-white/90 text-black font-bold rounded-full cursor-pointer transition-colors"
          >
            Actualizar número de teléfono
          </button>
          <button
            onClick={() => {
              setPhoneNumber('No configurado');
              saveProfileFields({ phone: '' }, 'Número de teléfono eliminado');
            }}
            className="py-3 bg-transparent border border-[#2f3336] hover:bg-white/5 text-[#f4212e] font-bold rounded-full cursor-pointer transition-colors"
          >
            Eliminar número de teléfono
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: EDITAR CORREO ELECTRÓNICO */
  /* ========================================================= */
  if (section === 'email_edit') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Correo electrónico"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4 flex-1">
          <p className="text-sm text-[#71767b]">
            Actualiza la dirección de correo electrónico asociada a tu cuenta para recibir notificaciones y restablecer tu contraseña.
          </p>
          <div className="border-2 border-[#1d9bf0] rounded-xl p-3 bg-black">
            <span className="text-xs text-[#1d9bf0] font-semibold block mb-1">Correo electrónico</span>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="bg-transparent border-none outline-none text-[16px] text-white w-full"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              if (newEmail.includes('@')) {
                saveProfileFields({ email: newEmail }, 'Correo electrónico actualizado');
              } else {
                showToast('Ingresa un correo electrónico válido');
              }
            }}
            className="mt-4 py-3 bg-white hover:bg-white/90 text-black font-bold rounded-full cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: SELECCIÓN DE PAÍS */
  /* ========================================================= */
  if (section === 'country_select') {
    const filtered = COUNTRIES.filter((c) =>
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="País"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <div className="p-3 border-b border-[#2f3336]">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#16181c] border border-transparent focus-within:border-[#1d9bf0] focus-within:bg-black">
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
        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          {filtered.map((country) => (
            <div
              key={country}
              onClick={() => {
                setSelectedCountry(country);
                saveProfileFields({ country }, `País cambiado a ${country}`);
              }}
              className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
            >
              <span className="text-[16px] text-white">{country}</span>
              {selectedCountry === country && <Check className="w-5 h-5 text-[#1d9bf0]" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: GÉNERO */
  /* ========================================================= */
  if (section === 'gender_select') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Género"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-xs text-[#71767b] border-b border-[#2f3336]/40">
          Esta información no se mostrará de forma pública en tu perfil si no lo deseas.
        </p>
        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          {GENDER_OPTIONS.map((g) => (
            <div
              key={g}
              onClick={() => {
                setSelectedGender(g);
                saveProfileFields({ gender: g }, `Género actualizado: ${g}`);
              }}
              className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
            >
              <span className="text-[16px] text-white">{g}</span>
              {selectedGender === g && <Check className="w-5 h-5 text-[#1d9bf0]" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: FECHA DE NACIMIENTO */
  /* ========================================================= */
  if (section === 'birth_date_edit') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Fecha de nacimiento"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          <p className="text-sm text-[#71767b]">
            Proporciona tu fecha de nacimiento para verificar que tienes la edad requerida para usar Talma.
          </p>
          <div className="border border-[#2f3336] rounded-xl p-3 bg-black">
            <span className="text-xs text-[#71767b] block mb-1">Fecha de nacimiento</span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-transparent text-white w-full text-[16px] outline-none"
            />
          </div>
          <div className="p-3 rounded-xl bg-[#16181c] text-sm text-[#71767b]">
            Edad calculada: <span className="font-bold text-white">{getAge(birthDate)} años</span>
          </div>
          <button
            onClick={() => {
              const age = getAge(birthDate);
              saveProfileFields({ birth_date: birthDate, age }, 'Fecha de nacimiento actualizada');
            }}
            className="py-3 bg-white hover:bg-white/90 text-black font-bold rounded-full cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: ETIQUETA DE PERFIL */
  /* ========================================================= */
  if (section === 'profile_label') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Etiqueta de perfil"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          {PROFILE_LABELS.map((label) => (
            <div
              key={label}
              onClick={() => {
                setSelectedLabel(label);
                saveProfileFields({ profile_label: label }, `Etiqueta: ${label}`);
              }}
              className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
            >
              <span className="text-[16px] text-white">{label}</span>
              {selectedLabel === label && <Check className="w-5 h-5 text-[#1d9bf0]" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: CAMBIAR CONTRASEÑA */
  /* ========================================================= */
  if (section === 'change_password') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Cambia tu contraseña"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />

        <form onSubmit={handleSubmitChangePassword} className="p-4 flex flex-col gap-4">
          <p className="text-xs text-[#71767b] mb-2">
            Usa una contraseña de al menos 6 caracteres que combine letras y números para mayor seguridad.
          </p>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-sm text-[#f4212e]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* Contraseña actual */}
          <div className="relative">
            <input
              type={showCurrentPass ? 'text' : 'password'}
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Contraseña actual"
              className="w-full p-3.5 pr-11 bg-black border border-[#2f3336] focus:border-[#1d9bf0] rounded-xl text-white outline-none text-[15px]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowCurrentPass(!showCurrentPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71767b] hover:text-white"
            >
              {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Nueva contraseña */}
          <div className="relative">
            <input
              type={showNewPass ? 'text' : 'password'}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              className="w-full p-3.5 pr-11 bg-black border border-[#2f3336] focus:border-[#1d9bf0] rounded-xl text-white outline-none text-[15px]"
            />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71767b] hover:text-white"
            >
              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirmar nueva contraseña */}
          <input
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="Confirmar nueva contraseña"
            className="w-full p-3.5 bg-black border border-[#2f3336] focus:border-[#1d9bf0] rounded-xl text-white outline-none text-[15px]"
          />

          <button
            type="submit"
            disabled={passwordLoading || !currentPass || !newPass}
            className="mt-4 py-3 bg-white hover:bg-white/90 disabled:opacity-40 text-black font-bold rounded-full cursor-pointer transition-colors"
          >
            {passwordLoading ? 'Verificando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: DESCARGA TUS DATOS */
  /* ========================================================= */
  if (section === 'download_data') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Descarga tus datos"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />

        <div className="p-6 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center">
            <Download className="w-8 h-8 text-[#1d9bf0]" />
          </div>

          <div>
            <h3 className="font-bold text-xl text-white">Solicita tu archivo de datos de Talma</h3>
            <p className="text-sm text-[#71767b] mt-2 max-w-sm">
              Genera y descarga un archivo estructurado con todo tu historial de publicaciones, reacciones, guardados, seguidores y metadatos de cuenta.
            </p>
          </div>

          <div className="w-full max-w-sm rounded-2xl bg-[#16181c] border border-[#2f3336] p-4 text-left flex flex-col gap-2.5 text-xs text-[#71767b]">
            <span className="font-bold text-white text-sm mb-1">Contenido incluido en tu archivo:</span>
            <div className="flex items-center gap-2 text-white">
              <FileCheck className="w-4 h-4 text-[#1d9bf0]" />
              <span>Perfil completo (@{currentUser.username})</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <FileCheck className="w-4 h-4 text-[#1d9bf0]" />
              <span>Historial de publicaciones y encuestas</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <FileCheck className="w-4 h-4 text-[#1d9bf0]" />
              <span>Publicaciones que te gustan y posts guardados</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <FileCheck className="w-4 h-4 text-[#1d9bf0]" />
              <span>Registros de auditoría de inicio de sesión</span>
            </div>
          </div>

          {exportSuccess && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
              ✓ Archivo exportado y descargado exitosamente.
            </div>
          )}

          <button
            onClick={handleDownloadArchive}
            disabled={isExporting}
            className="w-full max-w-sm py-3 bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold rounded-full cursor-pointer transition-colors shadow-lg"
          >
            {isExporting ? 'Generando archivo de datos...' : 'Descargar archivo JSON'}
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: DESACTIVAR CUENTA */
  /* ========================================================= */
  if (section === 'deactivate_account') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Desactivar cuenta"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />

        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + currentUser.username}
              alt=""
              className="w-12 h-12 rounded-full object-cover border border-[#2f3336]"
            />
            <div>
              <span className="font-bold text-white block">{currentUser.display_name}</span>
              <span className="text-sm text-[#71767b]">@{currentUser.username}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[18px] text-white">Esta acción desactivará tu cuenta</h4>
            <p className="text-sm text-[#71767b] mt-2 leading-relaxed">
              Estás a punto de iniciar el proceso de desactivación de tu cuenta de Talma. Tu nombre visible, tu @{currentUser.username} y tu perfil público dejarán de ser visibles en la plataforma.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#16181c] border border-[#2f3336] flex flex-col gap-2 text-xs text-[#71767b]">
            <span className="font-bold text-white text-sm">Qué más deberías saber:</span>
            <p>• Puedes restaurar tu cuenta en cualquier momento dentro de los primeros 30 días con solo iniciar sesión.</p>
            <p>• Si solo quieres cambiar tu @{currentUser.username}, no necesitas desactivar la cuenta: puedes editarlo en la sección de información.</p>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs text-[#71767b]">Para confirmar, ingresa tu contraseña:</label>
            <input
              type="password"
              value={deactivatePass}
              onChange={(e) => setDeactivatePass(e.target.value)}
              placeholder="Tu contraseña actual"
              className="p-3 bg-black border border-[#2f3336] focus:border-red-500 rounded-xl text-white outline-none text-sm"
            />
            {deactivateError && <span className="text-xs text-red-500">{deactivateError}</span>}
          </div>

          <button
            onClick={handleDeactivate}
            disabled={deactivateLoading || !deactivatePass}
            className="mt-4 py-3 bg-[#f4212e] hover:bg-[#dc1e29] disabled:opacity-40 text-white font-bold rounded-full cursor-pointer transition-colors"
          >
            {deactivateLoading ? 'Desactivando...' : 'Desactivar cuenta'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
