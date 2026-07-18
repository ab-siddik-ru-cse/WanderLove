export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** percent > 0 lightens toward white, percent < 0 darkens toward black. */
export function shadeHex(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  const target = percent > 0 ? 255 : 0;
  const amount = Math.abs(percent) / 100;

  r = Math.round(r + (target - r) * amount);
  g = Math.round(g + (target - g) * amount);
  b = Math.round(b + (target - b) * amount);

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
