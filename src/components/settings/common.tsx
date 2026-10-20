import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/** Switch estilo X: pista redondeada (#2f3336 apagado / #1d9bf0 encendido) y perilla blanca. */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
      disabled ? 'opacity-40 cursor-not-allowed' : ''
    } ${checked ? 'bg-[#1d9bf0]' : 'bg-[#2f3336]'}`}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

export const SettingsSubHeader: React.FC<{
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}> = ({ title, subtitle, onBack, rightAction }) => (
  <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 border-b border-[#2f3336] flex items-center justify-between px-4 h-[53px]">
    <div className="flex items-center gap-6 overflow-hidden">
      <button
        onClick={onBack}
        type="button"
        aria-label="Volver"
        className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      <div className="flex flex-col min-w-0">
        <span className="font-extrabold text-[19px] text-white leading-tight truncate">{title}</span>
        {subtitle && <span className="text-xs text-[#71767b] truncate">{subtitle}</span>}
      </div>
    </div>
    {rightAction && <div className="shrink-0">{rightAction}</div>}
  </div>
);

export const COUNTRIES = [
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
