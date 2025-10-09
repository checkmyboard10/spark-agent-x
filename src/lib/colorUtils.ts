export interface HslColor {
  h: number;
  s: number;
  l: number;
}

/**
 * Parse HSL string "160 84% 39%" to object { h, s, l }
 */
export const parseHsl = (hslString: string): HslColor => {
  const parts = hslString.trim().split(/\s+/);
  if (parts.length !== 3) {
    throw new Error('Invalid HSL format. Expected "H S% L%"');
  }
  
  return {
    h: parseFloat(parts[0]),
    s: parseFloat(parts[1].replace('%', '')),
    l: parseFloat(parts[2].replace('%', '')),
  };
};

/**
 * Format HSL object to string "H S% L%"
 */
export const formatHsl = (hsl: HslColor): string => {
  return `${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%`;
};

/**
 * Convert HSL to HEX
 */
export const hslToHex = (hsl: HslColor): string => {
  const h = hsl.h;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convert HEX to HSL
 */
export const hexToHsl = (hex: string): HslColor => {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Predefined color presets (HSL format)
 */
export const colorPresets = [
  { name: 'Verde', value: '160 84% 39%', hex: '#10b981' },
  { name: 'Azul', value: '199 89% 48%', hex: '#06b6d4' },
  { name: 'Roxo', value: '258 90% 66%', hex: '#8b5cf6' },
  { name: 'Rosa', value: '330 81% 60%', hex: '#ec4899' },
  { name: 'Laranja', value: '25 95% 53%', hex: '#f97316' },
  { name: 'Amarelo', value: '48 96% 53%', hex: '#f59e0b' },
  { name: 'Vermelho', value: '0 84% 60%', hex: '#ef4444' },
  { name: 'Cinza', value: '215 16% 47%', hex: '#64748b' },
];
