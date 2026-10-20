import React, { useState } from 'react';
import {
  Lock,
  Smartphone,
  Users,
  ChevronRight,
  ShieldCheck,
  Key,
  Shield,
  SmartphoneNfc,
  QrCode,
  Copy,
  Trash2,
  Plus,
  CheckCircle2,
  Upload,
  Globe,
  Clock,
  Laptop,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SettingsSubHeader, ToggleSwitch } from './common';

export type SecuritySubSection =
  | 'security_access'
  | 'security_details'
  | 'two_factor_auth'
  | 'identity_verification'
  | 'passkeys'
  | 'apps_sessions'
  | 'connected_apps'
  | 'active_sessions'
  | 'access_history'
  | 'logged_devices'
  | 'delegate'
  | 'delegate_accounts'
  | 'delegate_members';

interface SecuritySettingsProps {
  section: SecuritySubSection;
  currentUser: UserProfile;
  onNavigate: (section: SecuritySubSection) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  section,
  currentUser,
  onNavigate,
  onBack,
  showToast,
}) => {
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSms, setTwoFactorSms] = useState(false);
  const [twoFactorTotp, setTwoFactorTotp] = useState(false);
  const [twoFactorKey, setTwoFactorKey] = useState(false);
  const [backupCodes, setBackupCodes] = useState([
    'A9X2-7K4M', '3P8Q-9W2Z', 'L6D4-5R8T', 'B2N7-1V9C',
    'K8M3-4X7P', 'W9Z2-8Q3L', '5R8T-6D4B', '1V9C-2N7A',
  ]);

  // ID verification state
  const [idDocType, setIdDocType] = useState('DNI / Documento Nacional');
  const [idFileName, setIdFileName] = useState('');
  const [idVerifiedStatus, setIdVerifiedStatus] = useState<'none' | 'pending' | 'verified'>(
    currentUser.is_verified ? 'verified' : 'none'
  );

  // Additional password
  const [additionalPasswordEnabled, setAdditionalPasswordEnabled] = useState(false);

  // Passkeys state
  const [passkeys, setPasskeys] = useState<{ id: string; name: string; created: string }[]>([
    { id: '1', name: 'Windows Hello / Biométrico', created: '15 oct. 2026' },
  ]);

  // Connected apps state
  const [connectedApps, setConnectedApps] = useState([
    { id: '1', name: 'Talma Web Client v12', perms: 'Acceso completo a tu perfil y publicaciones', date: 'Conectado hoy' },
    { id: '2', name: 'Supabase Realtime Cloud', perms: 'Sincronización en tiempo real de notificaciones', date: 'Conectado hace 3 días' },
    { id: '3', name: 'Talma Developer API', perms: 'Lectura de métricas públicas', date: 'Conectado hace 1 mes' },
  ]);

  // Active sessions
  const [otherSessions, setOtherSessions] = useState([
    { id: '1', device: 'Safari en iPhone 15 Pro', location: 'Lima, Perú', date: 'Activo hace 2 horas', ip: '190.237.45.12' },
    { id: '2', device: 'Firefox en Windows 11', location: 'Lima, Perú', date: 'Activo hace 2 días', ip: '190.237.45.88' },
  ]);

  // Delegate state
  const [delegateInviteEnabled, setDelegateInviteEnabled] = useState(true);
  const [delegatedMembers, setDelegatedMembers] = useState([
    { id: '1', username: 'admin', role: 'Administrador' },
  ]);
  const [newDelegateUsername, setNewDelegateUsername] = useState('');
  const [newDelegateRole, setNewDelegateRole] = useState<'Administrador' | 'Colaborador'>('Colaborador');
  const [showInviteModal, setShowInviteModal] = useState(false);

  /* ========================================================= */
  /* SUB-VIEW: SECURITY AND ACCESS ROOT MENU */
  /* ========================================================= */
  if (section === 'security_access') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Seguridad y acceso a la cuenta"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Administra la seguridad de tu cuenta y lleva un control de su uso, incluidas las apps que conectaste a ella.
        </p>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          {/* Seguridad */}
          <button
            type="button"
            onClick={() => onNavigate('security_details')}
            className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
          >
            <Lock className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-white leading-tight">Seguridad</h3>
              <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                Administra la seguridad de tu cuenta, autenticación en dos fases, verificación de identidad y claves de acceso biométricas.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </button>

          {/* Apps y sesiones */}
          <button
            type="button"
            onClick={() => onNavigate('apps_sessions')}
            className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
          >
            <Smartphone className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-white leading-tight">Apps y sesiones</h3>
              <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                Consulta la información sobre cuándo iniciaste sesión en tu cuenta y las aplicaciones que conectaste a ella.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </button>

          {/* Delega */}
          <button
            type="button"
            onClick={() => onNavigate('delegate')}
            className="w-full text-left flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer transition-colors"
          >
            <Users className="w-6 h-6 text-[#71767b] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-white leading-tight">Delega</h3>
              <p className="text-[13px] text-[#71767b] mt-1 leading-normal">
                Compartir una cuenta con personas que tienen roles delegados de forma segura sin compartir tu contraseña.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: SEGURIDAD (DETAILS) */
  /* ========================================================= */
  if (section === 'security_details') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Seguridad"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Administra la seguridad de tu cuenta y los métodos de acceso autorizados.
        </p>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          {/* Autenticación en dos fases (2FA) */}
          <div
            onClick={() => onNavigate('two_factor_auth')}
            className="p-4 flex items-start justify-between gap-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1d9bf0]" />
                <h3 className="font-bold text-[16px] text-white">Autenticación en dos fases (2FA)</h3>
              </div>
              <p className="text-[13px] text-[#71767b] mt-1">
                Protege tu cuenta con SMS, apps de autenticación (TOTP) o llaves de seguridad físicas.
              </p>
              <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#16181c] text-[#1d9bf0]">
                {twoFactorEnabled ? 'Activada' : 'Desactivada'}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </div>

          {/* Verificación de documento de identidad */}
          <div
            onClick={() => onNavigate('identity_verification')}
            className="p-4 flex items-start justify-between gap-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1d9bf0]" />
                <h3 className="font-bold text-[16px] text-white">Verificación de documento de identidad</h3>
              </div>
              <p className="text-[13px] text-[#71767b] mt-1">
                Carga tu DNI, pasaporte o documento oficial para obtener la insignia de autenticidad en Talma.
              </p>
              <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#16181c] text-white">
                {idVerifiedStatus === 'verified' ? '✓ Verificado' : idVerifiedStatus === 'pending' ? '⏳ En revisión' : 'No solicitada'}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </div>

          {/* Claves de acceso (Passkeys) */}
          <div
            onClick={() => onNavigate('passkeys')}
            className="p-4 flex items-start justify-between gap-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#1d9bf0]" />
                <h3 className="font-bold text-[16px] text-white">Administrar claves de acceso (Passkeys)</h3>
              </div>
              <p className="text-[13px] text-[#71767b] mt-1">
                Usa tu huella dactilar, Face ID o bloqueo de pantalla para iniciar sesión sin contraseñas.
              </p>
              <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#16181c] text-[#71767b]">
                {passkeys.length} clave(s) registrada(s)
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] shrink-0 self-center" />
          </div>

          {/* Protección con contraseña adicional */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-[16px] text-white">Protección de restablecimiento</h3>
              <p className="text-[13px] text-[#71767b] mt-1">
                Se requiere confirmación obligatoria por correo o teléfono para permitir cualquier restablecimiento de contraseña.
              </p>
            </div>
            <ToggleSwitch
              checked={additionalPasswordEnabled}
              onChange={(val) => {
                setAdditionalPasswordEnabled(val);
                showToast(val ? 'Protección adicional activada' : 'Protección adicional desactivada');
              }}
              label="Protección de restablecimiento"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: 2FA CONFIGURATION */
  /* ========================================================= */
  if (section === 'two_factor_auth') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Autenticación en dos fases"
          subtitle="Seguridad"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-6">
          <p className="text-sm text-[#71767b] leading-relaxed">
            Agrega una capa adicional de seguridad a tu cuenta. Siempre que inicies sesión en un nuevo dispositivo, se requerirá un código de verificación.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {/* Mensaje de texto (SMS) */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-[#71767b] mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[15px]">Mensaje de texto (SMS)</span>
                  <span className="text-xs text-[#71767b]">Usa tu número de teléfono móvil.</span>
                </div>
              </div>
              <ToggleSwitch
                checked={twoFactorSms}
                onChange={(val) => {
                  setTwoFactorSms(val);
                  setTwoFactorEnabled(val || twoFactorTotp || twoFactorKey);
                  showToast(val ? '2FA por SMS activado' : '2FA por SMS desactivado');
                }}
                label="2FA SMS"
              />
            </div>

            {/* App de autenticación (TOTP) */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-[#71767b] mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[15px]">App de autenticación (TOTP)</span>
                  <span className="text-xs text-[#71767b]">Google Authenticator, Authy o 1Password.</span>
                </div>
              </div>
              <ToggleSwitch
                checked={twoFactorTotp}
                onChange={(val) => {
                  setTwoFactorTotp(val);
                  setTwoFactorEnabled(val || twoFactorSms || twoFactorKey);
                  showToast(val ? '2FA por App TOTP activado' : '2FA por App TOTP desactivado');
                }}
                label="2FA App"
              />
            </div>

            {/* Llave de seguridad */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <SmartphoneNfc className="w-5 h-5 text-[#71767b] mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[15px]">Llave de seguridad física</span>
                  <span className="text-xs text-[#71767b]">Llave de seguridad FIDO / YubiKey.</span>
                </div>
              </div>
              <ToggleSwitch
                checked={twoFactorKey}
                onChange={(val) => {
                  setTwoFactorKey(val);
                  setTwoFactorEnabled(val || twoFactorSms || twoFactorTotp);
                  showToast(val ? '2FA por Llave física activado' : '2FA por Llave física desactivado');
                }}
                label="2FA Llave"
              />
            </div>
          </div>

          {/* Backup codes */}
          <div className="p-4 rounded-2xl bg-[#16181c] border border-[#2f3336] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Códigos de respaldo de emergencia</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(backupCodes.join('\n'));
                  showToast('Códigos de respaldo copiados al portapapeles');
                }}
                className="flex items-center gap-1.5 text-xs text-[#1d9bf0] font-semibold hover:underline"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar todos
              </button>
            </div>
            <p className="text-xs text-[#71767b]">
              Guarda estos códigos de un solo uso en un lugar seguro para acceder si pierdes tu dispositivo.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-2 bg-black border border-[#2f3336] rounded-lg text-center font-mono text-xs text-white">
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: IDENTIDAD VERIFICATION */
  /* ========================================================= */
  if (section === 'identity_verification') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Verificación de identidad"
          subtitle="Seguridad"
          onBack={onBack}
        />
        <div className="p-5 flex flex-col gap-5">
          <p className="text-sm text-[#71767b]">
            Verifica tu identidad para proteger tu cuenta contra suplantación y obtener la insignia verificada oficial en Talma.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#71767b] font-semibold">Tipo de documento:</label>
            <select
              value={idDocType}
              onChange={(e) => setIdDocType(e.target.value)}
              className="p-3 bg-black border border-[#2f3336] rounded-xl text-white outline-none text-sm"
            >
              <option value="DNI / Documento Nacional">DNI / Documento Nacional de Identidad</option>
              <option value="Pasaporte">Pasaporte Internacional</option>
              <option value="Licencia de Conducir">Licencia de Conducir</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-[#2f3336] hover:border-[#1d9bf0] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors">
            <Upload className="w-8 h-8 text-[#1d9bf0]" />
            <div>
              <span className="font-bold text-white text-sm block">Sube una foto de tu {idDocType}</span>
              <span className="text-xs text-[#71767b]">Formatos permitidos: JPG, PNG, PDF (Máx. 5MB)</span>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              id="id-file-input"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setIdFileName(e.target.files[0].name);
                  showToast('Documento seleccionado: ' + e.target.files[0].name);
                }
              }}
            />
            <label
              htmlFor="id-file-input"
              className="mt-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
            >
              {idFileName ? idFileName : 'Seleccionar archivo'}
            </label>
          </div>

          {idVerifiedStatus === 'pending' && (
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold">
              ⏳ Tu solicitud de verificación está en trámite por el equipo de Talma.
            </div>
          )}

          {idVerifiedStatus === 'verified' && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
              ✓ Tu cuenta está oficialmente verificada.
            </div>
          )}

          <button
            onClick={() => {
              if (!idFileName && idVerifiedStatus !== 'verified') {
                showToast('Selecciona un documento primero');
                return;
              }
              setIdVerifiedStatus('pending');
              showToast('Solicitud enviada para revisión');
            }}
            disabled={idVerifiedStatus === 'verified'}
            className="py-3 bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold rounded-full cursor-pointer"
          >
            {idVerifiedStatus === 'verified' ? 'Cuenta Verificada' : 'Enviar para verificación'}
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: PASSKEYS */
  /* ========================================================= */
  if (section === 'passkeys') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Claves de acceso (Passkeys)"
          subtitle="Seguridad"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          <p className="text-sm text-[#71767b]">
            Las claves de acceso te permiten iniciar sesión de forma segura usando la biometría de tu dispositivo (Face ID, Touch ID o Windows Hello).
          </p>

          <button
            onClick={async () => {
              try {
                const newKey = {
                  id: Date.now().toString(),
                  name: `Dispositivo actual (${navigator.platform || 'Móvil'})`,
                  created: 'Hoy',
                };
                setPasskeys((prev) => [...prev, newKey]);
                showToast('Clave de acceso biométrica registrada');
              } catch {
                showToast('Clave de acceso registrada');
              }
            }}
            className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-white/90 text-black font-bold rounded-full cursor-pointer transition-colors"
          >
            <Plus className="w-5 h-5" /> Agregar clave de acceso
          </button>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden mt-2">
            {passkeys.map((pk) => (
              <div key={pk.id} className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-[#1d9bf0] mt-0.5" />
                  <div>
                    <span className="font-bold text-white text-[15px] block">{pk.name}</span>
                    <span className="text-xs text-[#71767b]">Creada: {pk.created}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPasskeys(passkeys.filter((k) => k.id !== pk.id));
                    showToast('Clave de acceso eliminada');
                  }}
                  className="p-2 text-[#71767b] hover:text-[#f4212e] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: APPS Y SESIONES MENU */
  /* ========================================================= */
  if (section === 'apps_sessions') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Apps y sesiones"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Consulta la información sobre cuándo iniciaste sesión en tu cuenta y las aplicaciones que conectaste a ella.
        </p>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          <div
            onClick={() => onNavigate('connected_apps')}
            className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div>
              <span className="text-[15px] font-bold text-white block">Aplicaciones conectadas</span>
              <span className="text-xs text-[#71767b]">{connectedApps.length} aplicaciones activas</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b]" />
          </div>

          <div
            onClick={() => onNavigate('active_sessions')}
            className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div>
              <span className="text-[15px] font-bold text-white block">Sesiones activas</span>
              <span className="text-xs text-[#71767b]">Dispositivo actual: Lima, Perú (Activo ahora)</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b]" />
          </div>

          <div
            onClick={() => onNavigate('access_history')}
            className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div>
              <span className="text-[15px] font-bold text-white block">Historial de acceso a la cuenta</span>
              <span className="text-xs text-[#71767b]">Registro de inicios de sesión recientes</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b]" />
          </div>

          <div
            onClick={() => onNavigate('logged_devices')}
            className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div>
              <span className="text-[15px] font-bold text-white block">Dispositivos de confianza</span>
              <span className="text-xs text-[#71767b]">Hardware con acceso permitido</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b]" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: APLICACIONES CONECTADAS */
  /* ========================================================= */
  if (section === 'connected_apps') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Aplicaciones conectadas"
          subtitle="Apps y sesiones"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-[#71767b]">
            Estas aplicaciones y servicios tienen permiso para acceder a datos de tu cuenta de Talma.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {connectedApps.map((app) => (
              <div key={app.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="font-bold text-white text-[15px] block">{app.name}</span>
                  <span className="text-xs text-[#71767b] block mt-0.5">{app.perms}</span>
                  <span className="text-[11px] text-[#1d9bf0] block mt-1">{app.date}</span>
                </div>
                <button
                  onClick={() => {
                    setConnectedApps(connectedApps.filter((a) => a.id !== app.id));
                    showToast(`Acceso revocado para ${app.name}`);
                  }}
                  className="px-3 py-1.5 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold cursor-pointer transition-colors"
                >
                  Revocar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: SESIONES ACTIVAS */
  /* ========================================================= */
  if (section === 'active_sessions') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Sesiones activas"
          subtitle="Apps y sesiones"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          {/* Dispositivo actual */}
          <div className="p-4 rounded-2xl bg-[#16181c] border-2 border-[#1d9bf0] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[15px]">Dispositivo actual</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1d9bf0] text-white font-bold">Activo ahora</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#71767b]">
              <Laptop className="w-4 h-4 text-[#1d9bf0]" />
              <span>Navegador Web · Windows 11</span>
            </div>
            <span className="text-xs text-[#71767b]">Ubicación: Lima, Perú · IP: {currentUser.last_ip || '190.237.45.12'}</span>
          </div>

          {/* Otras sesiones */}
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-white text-sm">Otras sesiones abiertas</span>
            {otherSessions.length > 0 && (
              <button
                onClick={() => {
                  setOtherSessions([]);
                  showToast('Se han cerrado todas las demás sesiones');
                }}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Cerrar todas
              </button>
            )}
          </div>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {otherSessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#71767b]">
                No hay otras sesiones activas en este momento.
              </div>
            ) : (
              otherSessions.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">{s.device}</span>
                    <span className="text-xs text-[#71767b]">{s.location} · {s.date}</span>
                  </div>
                  <button
                    onClick={() => {
                      setOtherSessions(otherSessions.filter((x) => x.id !== s.id));
                      showToast('Sesión cerrada');
                    }}
                    className="text-xs font-semibold text-red-400 hover:underline"
                  >
                    Cerrar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: HISTORIAL DE ACCESO */
  /* ========================================================= */
  if (section === 'access_history') {
    const historyEntries = [
      { id: '1', date: 'Hoy, 16:30', ip: currentUser.last_ip || '190.237.45.12', browser: 'Chrome / Windows', city: 'Lima, Perú', status: 'Exitoso' },
      { id: '2', date: 'Ayer, 21:14', ip: '190.237.45.12', browser: 'Chrome / Windows', city: 'Lima, Perú', status: 'Exitoso' },
      { id: '3', date: '18 oct. 2026, 10:02', ip: '190.237.45.90', browser: 'Mobile Safari / iOS', city: 'Lima, Perú', status: 'Exitoso' },
      { id: '4', date: '15 oct. 2026, 09:12', ip: currentUser.registration_ip || '190.237.45.12', browser: 'Registro inicial', city: 'Lima, Perú', status: 'Exitoso' },
    ];
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Historial de acceso"
          subtitle="Apps y sesiones"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-[#71767b]">
            Registro de auditoría con los inicios de sesión recientes y sus respectivas direcciones IP.
          </p>
          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {historyEntries.map((h) => (
              <div key={h.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">{h.browser}</span>
                  <span className="text-xs text-[#71767b]">{h.date} · IP {h.ip} ({h.city})</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-semibold">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: DISPOSITIVOS DE CONFIANZA */
  /* ========================================================= */
  if (section === 'logged_devices') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Dispositivos"
          subtitle="Apps y sesiones"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-[#71767b]">
            Dispositivos de confianza que no requieren códigos 2FA adicionales para ingresar.
          </p>
          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">PC de escritorio (Windows)</span>
                <span className="text-xs text-[#71767b]">Añadido el 15 oct. 2026 · Confiable</span>
              </div>
              <Check className="w-5 h-5 text-[#1d9bf0]" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Smartphone Personal</span>
                <span className="text-xs text-[#71767b]">Añadido el 16 oct. 2026 · Confiable</span>
              </div>
              <Check className="w-5 h-5 text-[#1d9bf0]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: DELEGA ROOT */
  /* ========================================================= */
  if (section === 'delegate') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Delega"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Compartir una cuenta con personas que tienen roles delegados.
        </p>

        <div className="p-4 flex items-center justify-between border-b border-[#2f3336]/40">
          <div className="flex-1 pr-4">
            <span className="text-[15px] font-bold text-white block">Permitir que otros te inviten a su cuenta</span>
            <p className="text-[13px] text-[#71767b] mt-0.5">
              Cuando esta opción está activada, otros usuarios pueden invitarte a compartir y administrar su cuenta.
            </p>
          </div>
          <ToggleSwitch
            checked={delegateInviteEnabled}
            onChange={(val) => {
              setDelegateInviteEnabled(val);
              showToast(val ? 'Invitaciones de delegación permitidas' : 'Invitaciones de delegación bloqueadas');
            }}
            label="Permitir invitaciones"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-[16px] text-white">Miembros delegados en tu cuenta</h4>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1 text-xs font-bold text-[#1d9bf0] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Invitar miembro
            </button>
          </div>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {delegatedMembers.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">@{m.username}</span>
                  <span className="text-xs text-[#71767b]">Rol: {m.role}</span>
                </div>
                {m.username !== 'admin' && (
                  <button
                    onClick={() => {
                      setDelegatedMembers(delegatedMembers.filter((x) => x.id !== m.id));
                      showToast(`Delegación revocada para @${m.username}`);
                    }}
                    className="text-xs font-semibold text-red-400 hover:underline"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Invitar miembro */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 animate-pop-in">
              <h3 className="font-bold text-lg text-white">Invitar miembro delegado</h3>
              <p className="text-xs text-[#71767b]">
                El usuario invitado podrá publicar o responder en nombre de tu cuenta sin conocer tu contraseña.
              </p>
              <input
                type="text"
                placeholder="Nombre de usuario (@ejemplo)"
                value={newDelegateUsername}
                onChange={(e) => setNewDelegateUsername(e.target.value.replace(/^@/, ''))}
                className="p-3 bg-black border border-[#2f3336] rounded-xl text-white outline-none text-sm"
              />
              <select
                value={newDelegateRole}
                onChange={(e: any) => setNewDelegateRole(e.target.value)}
                className="p-3 bg-black border border-[#2f3336] rounded-xl text-white outline-none text-sm"
              >
                <option value="Colaborador">Colaborador (Solo crear posts)</option>
                <option value="Administrador">Administrador (Control total)</option>
              </select>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-[#71767b] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (newDelegateUsername.trim()) {
                      setDelegatedMembers([
                        ...delegatedMembers,
                        { id: Date.now().toString(), username: newDelegateUsername.trim(), role: newDelegateRole },
                      ]);
                      showToast(`Invitación enviada a @${newDelegateUsername.trim()}`);
                      setNewDelegateUsername('');
                      setShowInviteModal(false);
                    }
                  }}
                  className="px-5 py-2 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-sm font-bold"
                >
                  Enviar invitación
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
