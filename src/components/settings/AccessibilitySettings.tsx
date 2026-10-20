import React, { useState } from 'react';
import {
  Eye,
  Sliders,
  Globe,
  Database,
  ChevronRight,
  Check,
  Volume2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SettingsSubHeader, ToggleSwitch } from './common';

export type AccessibilitySubSection =
  | 'accessibility_root'
  | 'accessibility_details'
  | 'display_details'
  | 'languages_details'
  | 'data_usage';

interface AccessibilitySettingsProps {
  section: AccessibilitySubSection;
  currentUser: UserProfile;
  onNavigate: (section: AccessibilitySubSection) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  section,
  currentUser,
  onNavigate,
  onBack,
  showToast,
}) => {
  // Accessibility
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [requireAltText, setRequireAltText] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  // Display
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [accentColor, setAccentColor] = useState<string>('#1d9bf0');
  const [bgTheme, setBgTheme] = useState<'dark' | 'dim' | 'light'>('dark');

  // Languages
  const [displayLanguage, setDisplayLanguage] = useState('Español');

  // Data usage
  const [dataSaver, setDataSaver] = useState(false);
  const [videoAutoplay, setVideoAutoplay] = useState<'always' | 'wifi' | 'never'>('wifi');
  const [highResImages, setHighResImages] = useState<'always' | 'wifi' | 'never'>('wifi');

  /* ========================================================= */
  /* ROOT: ACCESIBILIDAD, PANTALLA E IDIOMAS */
  /* ========================================================= */
  if (section === 'accessibility_root') {
    return (
      <div className="flex flex-col">
        <SettingsSubHeader
          title="Accesibilidad, pantalla e idiomas"
          subtitle={`@${currentUser.username}`}
          onBack={onBack}
        />
        <p className="p-4 text-[13px] text-[#71767b] leading-normal border-b border-[#2f3336]/40">
          Administra la forma en que se muestra el contenido de Talma y personaliza tu experiencia visual y de lectura.
        </p>

        <div className="flex flex-col divide-y divide-[#2f3336]/40">
          <div
            onClick={() => onNavigate('accessibility_details')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Eye className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Accesibilidad</span>
              <span className="text-[13px] text-[#71767b]">
                Contraste, movimiento reducido y compatibilidad con lectores de pantalla.
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('display_details')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Sliders className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Pantalla</span>
              <span className="text-[13px] text-[#71767b]">
                Personaliza el tamaño de fuente, colores de énfasis y tema de fondo.
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('languages_details')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Globe className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Idiomas</span>
              <span className="text-[13px] text-[#71767b]">
                Idioma actual: {displayLanguage} · Idiomas para recomendaciones.
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>

          <div
            onClick={() => onNavigate('data_usage')}
            className="flex items-start gap-4 p-4 hover:bg-white/[0.04] cursor-pointer"
          >
            <Database className="w-5 h-5 text-[#71767b] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[15px] text-white block">Uso de datos</span>
              <span className="text-[13px] text-[#71767b]">
                Ahorro de datos, reproducción automática y carga multimedia en alta calidad.
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71767b] self-center" />
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: ACCESIBILIDAD */
  /* ========================================================= */
  if (section === 'accessibility_details') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Accesibilidad"
          subtitle="Accesibilidad, pantalla e idiomas"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Aumentar el contraste de color</span>
                <span className="text-xs text-[#71767b]">Mejora el contraste de los bordes y textos</span>
              </div>
              <ToggleSwitch
                checked={highContrast}
                onChange={(val) => {
                  setHighContrast(val);
                  showToast(val ? 'Alto contraste activado' : 'Alto contraste desactivado');
                }}
                label="Alto contraste"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Reducir movimiento</span>
                <span className="text-xs text-[#71767b]">Limita las animaciones en la interfaz</span>
              </div>
              <ToggleSwitch
                checked={reduceMotion}
                onChange={(val) => {
                  setReduceMotion(val);
                  showToast(val ? 'Movimiento reducido' : 'Animaciones normales');
                }}
                label="Reducir movimiento"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Efectos de sonido</span>
                <span className="text-xs text-[#71767b]">Reproducir sonidos breves para acciones</span>
              </div>
              <ToggleSwitch
                checked={soundEffects}
                onChange={(val) => {
                  setSoundEffects(val);
                  showToast(val ? 'Sonidos activados' : 'Sonidos desactivados');
                }}
                label="Sonidos"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: PANTALLA */
  /* ========================================================= */
  if (section === 'display_details') {
    const accents = [
      { color: '#1d9bf0', name: 'Azul' },
      { color: '#ffd400', name: 'Amarillo' },
      { color: '#f91880', name: 'Rosa' },
      { color: '#7856ff', name: 'Morado' },
      { color: '#ff7a00', name: 'Naranja' },
      { color: '#00ba7c', name: 'Verde' },
    ];

    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Pantalla"
          subtitle="Accesibilidad, pantalla e idiomas"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-6">
          <p className="text-sm text-[#71767b]">
            Administra el tamaño de fuente, color y fondo. Estos ajustes afectan a la cuenta en este navegador.
          </p>

          {/* Tamaño de fuente */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <span className="font-bold text-white text-sm">Tamaño de la fuente</span>
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setFontSize('sm');
                  showToast('Fuente pequeña seleccionada');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  fontSize === 'sm' ? 'border-[#1d9bf0] bg-[#1d9bf0]/10 text-white' : 'border-[#2f3336] text-[#71767b]'
                }`}
              >
                Aa Pequeña
              </button>
              <button
                onClick={() => {
                  setFontSize('md');
                  showToast('Fuente predeterminada seleccionada');
                }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${
                  fontSize === 'md' ? 'border-[#1d9bf0] bg-[#1d9bf0]/10 text-white' : 'border-[#2f3336] text-[#71767b]'
                }`}
              >
                Aa Normal
              </button>
              <button
                onClick={() => {
                  setFontSize('lg');
                  showToast('Fuente grande seleccionada');
                }}
                className={`flex-1 py-2 rounded-xl text-base font-bold border transition-colors ${
                  fontSize === 'lg' ? 'border-[#1d9bf0] bg-[#1d9bf0]/10 text-white' : 'border-[#2f3336] text-[#71767b]'
                }`}
              >
                Aa Grande
              </button>
            </div>
          </div>

          {/* Color de énfasis */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <span className="font-bold text-white text-sm">Color de énfasis</span>
            <div className="flex items-center justify-around pt-2">
              {accents.map((acc) => (
                <button
                  key={acc.color}
                  type="button"
                  title={acc.name}
                  aria-label={acc.name}
                  onClick={() => {
                    setAccentColor(acc.color);
                    showToast(`Color ${acc.name} seleccionado`);
                  }}
                  style={{ backgroundColor: acc.color }}
                  className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-md transform active:scale-95 transition-transform"
                >
                  {accentColor === acc.color && <Check className="w-5 h-5 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Fondo */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <span className="font-bold text-white text-sm">Fondo</span>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { key: 'dark', title: 'Negro absoluto', bg: 'bg-black text-white' },
                { key: 'dim', title: 'Noche oscura', bg: 'bg-[#15202b] text-white' },
                { key: 'light', title: 'Predeterminado', bg: 'bg-[#0b0e14] text-white' },
              ].map((bg) => (
                <button
                  key={bg.key}
                  type="button"
                  title={bg.title}
                  aria-label={bg.title}
                  onClick={() => {
                    setBgTheme(bg.key as any);
                    showToast('Tema de fondo seleccionado');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-colors ${bg.bg} ${
                    bgTheme === bg.key ? 'border-[#1d9bf0] ring-1 ring-[#1d9bf0]' : 'border-[#2f3336]'
                  }`}
                >
                  <span className="text-xs font-bold">{bg.title}</span>
                  {bgTheme === bg.key && <Check className="w-4 h-4 text-[#1d9bf0]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: IDIOMAS */
  /* ========================================================= */
  if (section === 'languages_details') {
    const languages = [
      'Español',
      'English',
      'Português',
      'Français',
      'Deutsch',
      'Italiano',
      '日本語 (Japonés)',
    ];

    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Idiomas"
          subtitle="Accesibilidad, pantalla e idiomas"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-[#71767b]">
            Selecciona el idioma principal en el que deseas interactuar con Talma.
          </p>

          <div className="flex flex-col divide-y divide-[#2f3336]/40 border border-[#2f3336] rounded-2xl overflow-hidden">
            {languages.map((lang) => (
              <div
                key={lang}
                onClick={() => {
                  setDisplayLanguage(lang);
                  showToast(`Idioma cambiado a ${lang}`);
                }}
                className="p-4 flex items-center justify-between hover:bg-white/[0.04] cursor-pointer"
              >
                <span className="text-sm font-semibold text-white">{lang}</span>
                {displayLanguage === lang && <Check className="w-5 h-5 text-[#1d9bf0]" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* SUB-VIEW: USO DE DATOS */
  /* ========================================================= */
  if (section === 'data_usage') {
    return (
      <div className="flex flex-col min-h-screen">
        <SettingsSubHeader
          title="Uso de datos"
          subtitle="Accesibilidad, pantalla e idiomas"
          onBack={onBack}
        />
        <div className="p-4 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#16181c] border border-[#2f3336]">
            <div className="flex-1">
              <span className="font-bold text-white text-[15px] block">Ahorrador de datos</span>
              <p className="text-xs text-[#71767b] mt-1">
                Cuando está activado, los videos no se reproducirán automáticamente y las imágenes se descargarán con menor calidad.
              </p>
            </div>
            <ToggleSwitch
              checked={dataSaver}
              onChange={(val) => {
                setDataSaver(val);
                showToast(val ? 'Ahorrador de datos activado' : 'Ahorrador de datos desactivado');
              }}
              label="Ahorrador de datos"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#71767b]">Reproducción automática de video:</label>
            <select
              value={videoAutoplay}
              onChange={(e) => {
                setVideoAutoplay(e.target.value as any);
                showToast('Preferencia de video actualizada');
              }}
              className="p-3 bg-black border border-[#2f3336] rounded-xl text-white text-sm outline-none"
            >
              <option value="wifi">Solo con Wi-Fi</option>
              <option value="always">Datos móviles y Wi-Fi</option>
              <option value="never">Nunca reproducir automáticamente</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#71767b]">Imágenes de alta resolución:</label>
            <select
              value={highResImages}
              onChange={(e) => {
                setHighResImages(e.target.value as any);
                showToast('Preferencia de imágenes actualizada');
              }}
              className="p-3 bg-black border border-[#2f3336] rounded-xl text-white text-sm outline-none"
            >
              <option value="wifi">Solo con Wi-Fi</option>
              <option value="always">Datos móviles y Wi-Fi</option>
              <option value="never">Nunca cargar en alta calidad</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
