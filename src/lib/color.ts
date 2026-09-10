// Converts a #rrggbb hex color to an `oklch(L C H)` CSS string using the
// standard sRGB -> linear sRGB -> OKLab -> OKLCH pipeline (Björn Ottosson).
function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function hexToOklch(hex: string): string {
  const normalized = hex.replace("#", "");
  const r = srgbToLinear(parseInt(normalized.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(normalized.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(normalized.slice(4, 6), 16) / 255);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bLab * bLab);
  let H = (Math.atan2(bLab, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

function linearToSrgb(c: number) {
  const clamped = Math.min(1, Math.max(0, c));
  return clamped <= 0.0031308
    ? clamped * 12.92
    : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

// Inverse of hexToOklch, for showing a current OKLCH value in an <input type="color">.
export function oklchToHex(oklch: string): string {
  const match = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/.exec(oklch);
  if (!match) return "#000000";
  const [, lStr, cStr, hStr] = match;
  const L = parseFloat(lStr);
  const C = parseFloat(cStr);
  const H = (parseFloat(hStr) * Math.PI) / 180;

  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bChannel = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toHex = (c: number) =>
    Math.round(linearToSrgb(c) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(bChannel)}`;
}

// Picks a near-black or near-white foreground for a given OKLCH background,
// matching the neutral foreground tokens already used in globals.css.
export function contrastingForeground(oklchColor: string): string {
  const match = /oklch\(\s*([\d.]+)/.exec(oklchColor);
  const lightness = match ? parseFloat(match[1]) : 0.5;
  return lightness > 0.6 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)";
}

const OKLCH_PATTERN = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/;

export function isValidOklch(value: string): boolean {
  return OKLCH_PATTERN.test(value.trim());
}
