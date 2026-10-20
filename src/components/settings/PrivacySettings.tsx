import React, { useState } from 'react';
import {
  Users,
  Eye,
  VolumeX,
  Mail,
  Radio,
  Search,
  ChevronRight,
  ShieldAlert,
  FileText,
  Plus,
  Trash2,
  Lock,
  Unlock,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SettingsSubHeader, ToggleSwitch } from './common';

export type PrivacySubSection =
  | 'privacy_safety'
  | 'privacy_audience'
  | 'privacy_posts'
  | 'privacy_content'
  | 'privacy_mute_block'
  | 'blocked_accounts'
  | 'muted_accounts'
  | 'muted_words'
  | 'privacy_dms'
  | 'privacy_spaces'
  | 'privacy_discovery';

interface PrivacySettingsProps {
  section: PrivacySubSection;
  currentUser: UserProfile;
  onNavigate: (section: PrivacySubSection) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  section,
  currentUser,
  onNavigate,
  onBack,
  showToast,
  onUpdateUser,
}) => {
  // Audience
  const [isProtected, setIsProtected] = useState(currentUser.is_protected ?? false);
  const [photoTagging, setPhotoTagging] = useState<'anyone' | 'following' | 'none'>('following');

  // Posts
  const [sensitiveMediaWarning, setSensitiveMediaWarning] = useState(false);
  const [allowVideoDownloads, setAllowVideoDownloads] = useState(true);

  // Content you see
  const [displaySensitiveMedia, setDisplaySensitiveMedia] = useState(false);
  const [hideSensitiveSearch, setHideSensitiveSearch] = useState(true);

  // Mute & block lists
  const [blockedUsers, setBlockedUsers] = useState<string[]>(['troll_account', 'spam_bot_99']);
  const [mutedUsers, setMutedUsers] = useState<string[]>(['noisy_news']);
  const [mutedWords, setMutedWords] = useState<string[]>(['crypto', 'airdrop', 'giveaway']);
  const [newMutedWord, setNewMutedWord] = useState('');
  const [showAddWordModal, setShowAddWordModal] = useState(false);

  // DMs
  const [dmPermission, setDmPermission] = useState<'everyone' | 'following' | 'verified'>('everyone');
  const [filterLowQualityDms, setFilterLowQualityDms] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);

  // Spaces
  const [shareSpacesListening, setShareSpacesListening] = useState(true);

  // Discovery
  const [discoverByEmail, setDiscoverByEmail] = useState(true);
  const [discoverByPhone, setDiscoverByPhone] = useState(false);

  /* ========================================================= */
  /* ROOT: PRIVACIDAD Y SEGURIDAD */
  /* ========================================================= */
  if (section === 'privacy_safety') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Privacidad y seguridad"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Administra qué información ves y compartes en Talma.
        </p>

        <div className="p-4 border-b border-[#2f3336]/40">
          <h4 className="text-xs font-bold text-[#71767b] uppercase tracking-wider mb-2">Tu actividad en Talma</h4>
        </div>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          {/* Audiencia y etiquetas */}
          <div
            onClick={() => onNavigate('privacy_audience')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Users className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Audiencia, multimedia y etiquetas</span>
              <span className="text-[13px] text-[#71767b]">
                {isProtected ? 'Publicaciones protegidas' : 'Público'} · Administra la información que compartes.
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Tus publicaciones */}
          <div
            onClick={() => onNavigate('privacy_posts')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <FileText className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Tus publicaciones</span>
              <span className="text-[13px] text-[#71767b]">Administra la configuración de tus publicaciones multimedia y descargas.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Contenido que ves */}
          <div
            onClick={() => onNavigate('privacy_content')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Eye className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Contenido que ves</span>
              <span className="text-[13px] text-[#71767b]">Decide lo que ves en Talma según tus preferencias de temas y contenido delicado.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Silenciar y bloquear */}
          <div
            onClick={() => onNavigate('privacy_mute_block')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <VolumeX className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Silenciar y bloquear</span>
              <span className="text-[13px] text-[#71767b]">
                {blockedUsers.length} bloqueada(s), {mutedUsers.length} silenciada(s), {mutedWords.length} palabra(s).
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Mensajes directos */}
          <div
            onClick={() => onNavigate('privacy_dms')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Mail className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Mensajes directos</span>
              <span className="text-[13px] text-[#71767b]">Administra quién puede enviarte mensajes y las confirmaciones de lectura.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Espacios */}
          <div
            onClick={() => onNavigate('privacy_spaces')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Radio className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Espacios de audio</span>
              <span className="text-[13px] text-[#71767b]">Administra quién puede ver tu actividad al escuchar o unirte a Espacios.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          {/* Descubrimiento y contactos */}
          <div
            onClick={() => onNavigate('privacy_discovery')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Search className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Descubrimiento y contactos</span>
              <span className="text-[13px] text-[#71767b]">Controla si pueden encontrarte por tu correo electrónico o teléfono.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: AUDIENCIA Y ETIQUETAS */
  /* ========================================================= */
  if (section === 'privacy_audience') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Audiencia y etiquetas"
          subtitle="Privacidad y seguridad"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-6">
          <p className="text-sm text-[#71767b]">
            Administra la información que permites que otras personas vean en Talma.
          </p>

          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Proteger tus publicaciones</span>
              <p className="text-xs text-[#71767b] mt-1">
                Al seleccionar esta opción, tus publicaciones solo serán visibles para las personas que apruebes como seguidores.
              </p>
            </div>
            <ToggleSwitch
              checked={isProtected}
              onChange={(val) => {
                setIsProtected(val);
                onUpdateUser?.({ is_protected: val });
                showToast(val ? 'Cuenta privada: publicaciones protegidas' : 'Cuenta pública: publicaciones visibles para todos');
              }}
              label="Proteger publicaciones"
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-sm">Etiquetado de fotos</span>
            <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
              {[
                { key: 'anyone', title: 'Cualquiera puede etiquetarte' },
                { key: 'following', title: 'Solo las personas que sigues pueden etiquetarte' },
                { key: 'none', title: 'Nadie puede etiquetarte' },
              ].map((opt) => (
                <label key={opt.key} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.04]">
                  <span className="text-sm text-white">{opt.title}</span>
                  <input
                    type="radio"
                    name="photoTagging"
                    checked={photoTagging === opt.key}
                    onChange={() => {
                      setPhotoTagging(opt.key as any);
                      showToast('Preferencia de etiquetado actualizada');
                    }}
                    className="accent-[#1d9bf0] w-4 h-4 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: TUS PUBLICACIONES */
  /* ========================================================= */
  if (section === 'privacy_posts') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Tus publicaciones"
          subtitle="Privacidad y seguridad"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Marcar contenido delicado</span>
              <p className="text-xs text-[#71767b] mt-1">
                Marca el contenido multimedia que publicas como potencialmente delicado para que otros usuarios reciban una advertencia antes de verlo.
              </p>
            </div>
            <ToggleSwitch
              checked={sensitiveMediaWarning}
              onChange={(val) => {
                setSensitiveMediaWarning(val);
                showToast(val ? 'Advertencia de contenido delicado activada' : 'Advertencia desactivada');
              }}
              label="Marcar contenido delicado"
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Permitir descarga de tus videos</span>
              <p className="text-xs text-[#71767b] mt-1">
                Permite a otros usuarios descargar los videos que compartas en tus publicaciones.
              </p>
            </div>
            <ToggleSwitch
              checked={allowVideoDownloads}
              onChange={(val) => {
                setAllowVideoDownloads(val);
                showToast(val ? 'Descarga de videos permitida' : 'Descarga de videos restringida');
              }}
              label="Permitir descarga de videos"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: CONTENIDO QUE VES */
  /* ========================================================= */
  if (section === 'privacy_content') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Contenido que ves"
          subtitle="Privacidad y seguridad"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Mostrar multimedia delicado</span>
              <p className="text-xs text-[#71767b] mt-1">
                Muestra fotos y videos que puedan contener contenido delicado sin advertencia previa.
              </p>
            </div>
            <ToggleSwitch
              checked={displaySensitiveMedia}
              onChange={(val) => {
                setDisplaySensitiveMedia(val);
                showToast(val ? 'Se mostrará contenido delicado' : 'Contenido delicado oculto tras advertencia');
              }}
              label="Mostrar multimedia delicado"
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Ocultar contenido sensible en búsquedas</span>
              <p className="text-xs text-[#71767b] mt-1">
                Evita que publicaciones con contenido potencialmente delicado aparezcan en tus búsquedas de Talma.
              </p>
            </div>
            <ToggleSwitch
              checked={hideSensitiveSearch}
              onChange={(val) => {
                setHideSensitiveSearch(val);
                showToast(val ? 'Búsqueda segura activada' : 'Búsqueda sin filtros activada');
              }}
              label="Búsqueda segura"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: SILENCIAR Y BLOQUEAR MENU */
  /* ========================================================= */
  if (section === 'privacy_mute_block') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Silenciar y bloquear"
          subtitle="Privacidad y seguridad"
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Administra las cuentas, las palabras y las notificaciones que decidiste silenciar o bloquear.
        </p>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          <div
            onClick={() => onNavigate('blocked_accounts')}
            className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div>
              <span className="font-bold text-[15px] text-white block">Cuentas bloqueadas</span>
              <span className="text-xs text-[#71767b]">{blockedUsers.length} cuentas bloqueadas</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b]" />
          </div>

          <div
            onClick={() => onNavigate('muted_accounts')}
            className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div>
              <span className="font-bold text-[15px] text-white block">Cuentas silenciadas</span>
              <span className="text-xs text-[#71767b]">{mutedUsers.length} cuentas silenciadas</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b]" />
          </div>

          <div
            onClick={() => onNavigate('muted_words')}
            className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <div>
              <span className="font-bold text-[15px] text-white block">Palabras silenciadas</span>
              <span className="text-xs text-[#71767b]">{mutedWords.length} palabras o etiquetas</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b]" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: CUENTAS BLOQUEADAS */
  /* ========================================================= */
  if (section === 'blocked_accounts') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Cuentas bloqueadas"
          subtitle="Silenciar y bloquear"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-[#71767b]">
            Cuando bloqueas a alguien, no puede seguirte ni ver tus publicaciones, y tú tampoco verás sus notificaciones ni tweets.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {blockedUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#71767b]">No has bloqueado a nadie.</div>
            ) : (
              blockedUsers.map((u) => (
                <div key={u} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">@{u}</span>
                    <span className="text-xs text-red-400 font-semibold">Bloqueado</span>
                  </div>
                  <button
                    onClick={() => {
                      setBlockedUsers(blockedUsers.filter((x) => x !== u));
                      showToast(`Has desbloqueado a @${u}`);
                    }}
                    className="px-4 py-1.5 rounded-full border border-red-500/50 hover:bg-red-500/10 text-red-500 font-bold text-xs"
                  >
                    Desbloquear
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
  /* SUB-VIEW: CUENTAS SILENCIADAS */
  /* ========================================================= */
  if (section === 'muted_accounts') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Cuentas silenciadas"
          subtitle="Silenciar y bloquear"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-[#71767b]">
            Al silenciar una cuenta, no verás sus publicaciones en tu cronología, pero la persona no sabrá que la silenciaste.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {mutedUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#71767b]">No has silenciado ninguna cuenta.</div>
            ) : (
              mutedUsers.map((u) => (
                <div key={u} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">@{u}</span>
                    <span className="text-xs text-[#71767b]">Silenciado</span>
                  </div>
                  <button
                    onClick={() => {
                      setMutedUsers(mutedUsers.filter((x) => x !== u));
                      showToast(`Has desilenciado a @${u}`);
                    }}
                    className="px-4 py-1.5 rounded-full border border-[#2f3336] hover:bg-white/10 text-white font-bold text-xs"
                  >
                    Desilenciar
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
  /* SUB-VIEW: PALABRAS SILENCIADAS */
  /* ========================================================= */
  if (section === 'muted_words') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Palabras silenciadas"
          subtitle="Silenciar y bloquear"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#71767b]">No verás publicaciones que contengan estas palabras o hashtags.</p>
            <button
              onClick={() => setShowAddWordModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {mutedWords.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#71767b]">No tienes palabras silenciadas.</div>
            ) : (
              mutedWords.map((word) => (
                <div key={word} className="p-4 flex items-center justify-between">
                  <span className="font-bold text-white text-sm">"{word}"</span>
                  <button
                    type="button"
                    title="Eliminar palabra"
                    onClick={() => {
                      setMutedWords(mutedWords.filter((w) => w !== word));
                      showToast(`Palabra "${word}" eliminada`);
                    }}
                    className="p-1.5 text-[#71767b] hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal agregar palabra */}
        {showAddWordModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4">
              <h3 className="font-bold text-lg text-white">Silenciar palabra o frase</h3>
              <input
                type="text"
                placeholder="Ingresa la palabra o #hashtag"
                value={newMutedWord}
                onChange={(e) => setNewMutedWord(e.target.value)}
                className="p-3 bg-black border border-[#2f3336] rounded-xl text-white outline-none text-sm"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddWordModal(false)}
                  className="px-4 py-2 text-sm text-[#71767b] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (newMutedWord.trim()) {
                      setMutedWords([...mutedWords, newMutedWord.trim().toLowerCase()]);
                      showToast(`Palabra "${newMutedWord.trim()}" silenciada`);
                      setNewMutedWord('');
                      setShowAddWordModal(false);
                    }
                  }}
                  className="px-5 py-2 bg-[#1d9bf0] text-white text-sm font-bold rounded-full"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: MENSAJES DIRECTOS (DMs) */
  /* ========================================================= */
  if (section === 'privacy_dms') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Mensajes directos"
          subtitle="Privacidad y seguridad"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-sm">Permitir solicitudes de mensajes de:</span>
            <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
              {[
                { key: 'everyone', title: 'Cualquiera', desc: 'Cualquier usuario de Talma puede enviarte una solicitud de mensaje.' },
                { key: 'verified', title: 'Solo usuarios verificados', desc: 'Solo cuentas verificadas con insignia pueden solicitar chatear.' },
                { key: 'following', title: 'Solo personas que sigues', desc: 'Nadie más podrá enviarte mensajes directos.' },
              ].map((opt) => (
                <label key={opt.key} className="p-4 flex items-start justify-between cursor-pointer hover:bg-white/[0.04]">
                  <div className="pr-4">
                    <span className="text-sm font-bold text-white block">{opt.title}</span>
                    <span className="text-xs text-[#71767b]">{opt.desc}</span>
                  </div>
                  <input
                    type="radio"
                    name="dmPermission"
                    checked={dmPermission === opt.key}
                    onChange={() => {
                      setDmPermission(opt.key as any);
                      showToast('Preferencia de mensajes actualizada');
                    }}
                    className="accent-[#1d9bf0] w-4 h-4 mt-1 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Filtrar mensajes de baja calidad</span>
              <p className="text-xs text-[#71767b] mt-1">
                Oculta las solicitudes de mensajes que puedan contener spam o contenido no deseado.
              </p>
            </div>
            <ToggleSwitch
              checked={filterLowQualityDms}
              onChange={(val) => {
                setFilterLowQualityDms(val);
                showToast(val ? 'Filtro de spam activado' : 'Filtro de spam desactivado');
              }}
              label="Filtrar mensajes"
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Confirmaciones de lectura</span>
              <p className="text-xs text-[#71767b] mt-1">
                Permite que las personas en las conversaciones sepan cuándo has visto sus mensajes directos.
              </p>
            </div>
            <ToggleSwitch
              checked={showReadReceipts}
              onChange={(val) => {
                setShowReadReceipts(val);
                showToast(val ? 'Confirmaciones de lectura activadas' : 'Confirmaciones de lectura desactivadas');
              }}
              label="Confirmaciones de lectura"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: ESPACIOS */
  /* ========================================================= */
  if (section === 'privacy_spaces') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Espacios"
          subtitle="Privacidad y seguridad"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Permitir que tus seguidores vean a qué Espacios te unes</span>
              <p className="text-xs text-[#71767b] mt-1">
                Tus seguidores podrán ver en su cronología de Talma cuando estés escuchando activamente una sala de audio.
              </p>
            </div>
            <ToggleSwitch
              checked={shareSpacesListening}
              onChange={(val) => {
                setShareSpacesListening(val);
                showToast(val ? 'Actividad en Espacios compartida' : 'Actividad en Espacios privada');
              }}
              label="Espacios visibles"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: DESCUBRIMIENTO Y CONTACTOS */
  /* ========================================================= */
  if (section === 'privacy_discovery') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Descubrimiento y contactos"
          subtitle="Privacidad y seguridad"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Permitir que te encuentren por tu correo electrónico</span>
              <p className="text-xs text-[#71767b] mt-1">
                Las personas que tengan tu correo en su libreta de contactos podrán sugerirte como amigo en Talma.
              </p>
            </div>
            <ToggleSwitch
              checked={discoverByEmail}
              onChange={(val) => {
                setDiscoverByEmail(val);
                showToast(val ? 'Búsqueda por email permitida' : 'Búsqueda por email bloqueada');
              }}
              label="Descubrimiento email"
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Permitir que te encuentren por tu teléfono</span>
              <p className="text-xs text-[#71767b] mt-1">
                Las personas que tengan tu número de celular registrado podrán encontrarte rápidamente.
              </p>
            </div>
            <ToggleSwitch
              checked={discoverByPhone}
              onChange={(val) => {
                setDiscoverByPhone(val);
                showToast(val ? 'Búsqueda por teléfono permitida' : 'Búsqueda por teléfono bloqueada');
              }}
              label="Descubrimiento teléfono"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
