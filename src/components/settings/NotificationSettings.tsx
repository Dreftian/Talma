import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Bell,
  Mail,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SettingsSubHeader, ToggleSwitch } from './common';

export type NotificationSubSection =
  | 'notifications_root'
  | 'notification_filters'
  | 'advanced_filters'
  | 'notification_preferences'
  | 'push_notifications'
  | 'email_notifications'
  | 'sms_notifications';

interface NotificationSettingsProps {
  section: NotificationSubSection;
  currentUser: UserProfile;
  onNavigate: (section: NotificationSubSection) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  section,
  currentUser,
  onNavigate,
  onBack,
  showToast,
}) => {
  // Filters
  const [qualityFilter, setQualityFilter] = useState(true);
  const [muteNotFollowing, setMuteNotFollowing] = useState(false);
  const [muteNotFollowers, setMuteNotFollowers] = useState(false);
  const [muteDefaultAvatar, setMuteDefaultAvatar] = useState(true);
  const [muteUnconfirmedEmail, setMuteUnconfirmedEmail] = useState(true);

  // Push notifications
  const [pushMaster, setPushMaster] = useState(true);
  const [pushMentions, setPushMentions] = useState(true);
  const [pushReplies, setPushReplies] = useState(true);
  const [pushLikes, setPushLikes] = useState(true);
  const [pushRetweets, setPushRetweets] = useState(true);
  const [pushFollowers, setPushFollowers] = useState(true);
  const [pushDMs, setPushDMs] = useState(true);

  // Email notifications
  const [emailDigest, setEmailDigest] = useState(true);
  const [emailNews, setEmailNews] = useState(false);

  // SMS notifications
  const [smsAlerts, setSmsAlerts] = useState(false);

  /* ========================================================= */
  /* ROOT: NOTIFICACIONES */
  /* ========================================================= */
  if (section === 'notifications_root') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Notificaciones"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Selecciona el tipo de notificaciones que quieres recibir sobre tus actividades, tus intereses y tus recomendaciones.
        </p>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          <div
            onClick={() => onNavigate('notification_filters')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Filtros</span>
              <span className="text-[13px] text-[#71767b]">
                Filtro de calidad activo · Silenciar notificaciones que no quieras ver.
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('notification_preferences')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Bell className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Preferencias</span>
              <span className="text-[13px] text-[#71767b]">
                Personaliza tus notificaciones push, correo electrónico y SMS.
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: FILTROS */
  /* ========================================================= */
  if (section === 'notification_filters') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Filtros"
          subtitle="Notificaciones"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Filtro de calidad</span>
              <p className="text-xs text-[#71767b] mt-1">
                Filtra el contenido de menor calidad de tus notificaciones, como publicaciones duplicadas o posible spam generado automáticamente.
              </p>
            </div>
            <ToggleSwitch
              checked={qualityFilter}
              onChange={(val) => {
                setQualityFilter(val);
                showToast(val ? 'Filtro de calidad activado' : 'Filtro de calidad desactivado');
              }}
              label="Filtro de calidad"
            />
          </div>

          <div
            onClick={() => onNavigate('advanced_filters')}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#16181c] border border-[#2f3336] cursor-pointer hover:border-[#1d9bf0]"
          >
            <div>
              <span className="font-bold text-white text-[15px] block">Filtros avanzados</span>
              <span className="text-xs text-[#71767b]">Silenciar notificaciones por criterios de usuario</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b]" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: FILTROS AVANZADOS */
  /* ========================================================= */
  if (section === 'advanced_filters') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Filtros avanzados"
          subtitle="Filtros de notificaciones"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-[#71767b]">
            Silencia notificaciones de personas que cumplan con estos criterios:
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Que no sigues</span>
                <span className="text-xs text-[#71767b]">Personas fuera de tu lista de seguidos</span>
              </div>
              <ToggleSwitch
                checked={muteNotFollowing}
                onChange={(val) => {
                  setMuteNotFollowing(val);
                  showToast('Filtro actualizado');
                }}
                label="No sigues"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Que no te siguen</span>
                <span className="text-xs text-[#71767b]">Personas que no son tus seguidores</span>
              </div>
              <ToggleSwitch
                checked={muteNotFollowers}
                onChange={(val) => {
                  setMuteNotFollowers(val);
                  showToast('Filtro actualizado');
                }}
                label="No te siguen"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Con una foto de perfil predeterminada</span>
                <span className="text-xs text-[#71767b]">Cuentas sin avatar personalizado</span>
              </div>
              <ToggleSwitch
                checked={muteDefaultAvatar}
                onChange={(val) => {
                  setMuteDefaultAvatar(val);
                  showToast('Filtro actualizado');
                }}
                label="Avatar predeterminado"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Sin correo electrónico confirmado</span>
                <span className="text-xs text-[#71767b]">Cuentas no verificadas por email</span>
              </div>
              <ToggleSwitch
                checked={muteUnconfirmedEmail}
                onChange={(val) => {
                  setMuteUnconfirmedEmail(val);
                  showToast('Filtro actualizado');
                }}
                label="Email no confirmado"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: PREFERENCIAS */
  /* ========================================================= */
  if (section === 'notification_preferences') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Preferencias"
          subtitle="Notificaciones"
          onBack={onBack}
        />
        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          <div
            onClick={() => onNavigate('push_notifications')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Notificaciones push</span>
              <span className="text-[13px] text-[#71767b]">
                {pushMaster ? 'Activadas' : 'Desactivadas'} · Alertas directas a este dispositivo
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('email_notifications')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Mail className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Notificaciones por correo electrónico</span>
              <span className="text-[13px] text-[#71767b]">Resúmenes semanales y actividad relevante</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('sms_notifications')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Bell className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Notificaciones por SMS</span>
              <span className="text-[13px] text-[#71767b]">{smsAlerts ? 'Activadas' : 'Desactivadas'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: NOTIFICACIONES PUSH */
  /* ========================================================= */
  if (section === 'push_notifications') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Notificaciones push"
          subtitle="Preferencias"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div>
              <span className="font-bold text-white text-[15px] block">Notificaciones push</span>
              <span className="text-xs text-[#71767b]">Recibir notificaciones en este dispositivo</span>
            </div>
            <ToggleSwitch
              checked={pushMaster}
              onChange={(val) => {
                setPushMaster(val);
                showToast(val ? 'Notificaciones push habilitadas' : 'Notificaciones push deshabilitadas');
              }}
              label="Push Master"
            />
          </div>

          {pushMaster && (
            <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-white font-medium">Menciones y respuestas</span>
                <ToggleSwitch checked={pushMentions} onChange={setPushMentions} label="Menciones" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-white font-medium">Me gusta</span>
                <ToggleSwitch checked={pushLikes} onChange={setPushLikes} label="Likes" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-white font-medium">Reposts y citas</span>
                <ToggleSwitch checked={pushRetweets} onChange={setPushRetweets} label="Reposts" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-white font-medium">Nuevos seguidores</span>
                <ToggleSwitch checked={pushFollowers} onChange={setPushFollowers} label="Seguidores" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-white font-medium">Mensajes directos</span>
                <ToggleSwitch checked={pushDMs} onChange={setPushDMs} label="DMs" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: EMAIL NOTIFICATIONS */
  /* ========================================================= */
  if (section === 'email_notifications') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Correo electrónico"
          subtitle="Preferencias"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Resumen semanal de Talma</span>
                <span className="text-xs text-[#71767b]">Recibe un correo con lo más relevante de tu red</span>
              </div>
              <ToggleSwitch checked={emailDigest} onChange={setEmailDigest} label="Resumen semanal" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Noticias y novedades de la plataforma</span>
                <span className="text-xs text-[#71767b]">Nuevas funciones y lanzamientos</span>
              </div>
              <ToggleSwitch checked={emailNews} onChange={setEmailNews} label="Noticias" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: SMS NOTIFICATIONS */
  /* ========================================================= */
  if (section === 'sms_notifications') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Notificaciones por SMS"
          subtitle="Preferencias"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div>
              <span className="font-bold text-white text-sm block">Alertas críticas por SMS</span>
              <span className="text-xs text-[#71767b]">Avisos de seguridad en tu número celular</span>
            </div>
            <ToggleSwitch
              checked={smsAlerts}
              onChange={(val) => {
                setSmsAlerts(val);
                showToast(val ? 'Alertas SMS activadas' : 'Alertas SMS desactivadas');
              }}
              label="SMS Alerts"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
