/**
 * Convert hex color to HSL (Hue, Saturation, Lightness)
 * Returns hue in degrees (0-360), saturation and lightness as 0-1
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex to RGB
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
    h: h * 360,
    s,
    l,
  };
}

/**
 * Compare two colors for sorting by hue (color wheel position)
 * This groups similar colors together (reds, oranges, yellows, greens, blues, purples)
 */
export function compareColorsByHue(colorA: string, colorB: string): number {
  const hslA = hexToHSL(colorA);
  const hslB = hexToHSL(colorB);

  // Primary sort: by hue (color wheel position)
  if (hslA.h !== hslB.h) {
    return hslA.h - hslB.h;
  }

  // Secondary sort: by saturation (more vibrant colors first)
  if (hslA.s !== hslB.s) {
    return hslB.s - hslA.s;
  }

  // Tertiary sort: by lightness
  return hslA.l - hslB.l;
}
