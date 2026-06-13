import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const assets = path.join(root, 'assets');
const artDir = path.join(assets, 'art');

// Keep in sync with src/lib/art.ts
const PALETTES = [
  { colors: ['#F6B26B', '#E2674A'], angle: 135 },
  { colors: ['#E98F6F', '#B14E5E'], angle: 160 },
  { colors: ['#F4CE6A', '#E08A4E'], angle: 140 },
  { colors: ['#7B9DC9', '#46618F'], angle: 150 },
  { colors: ['#F2A9A2', '#C96A8B'], angle: 145 },
  { colors: ['#E8B27D', '#A65B43'], angle: 150 },
  { colors: ['#C98A5E', '#7E4A38'], angle: 140 },
  { colors: ['#A86FA0', '#5F4B8B'], angle: 155 },
  { colors: ['#EE9E5F', '#C24E55'], angle: 140 },
  { colors: ['#D96E5B', '#8E3B58'], angle: 150 },
  { colors: ['#F3C57E', '#D2694F'], angle: 135 },
  { colors: ['#F0D9A6', '#D49A57'], angle: 150 },
];

const CREAM = '#FAF4E8';
const DISC = '#2F2419';
const LABEL_OUTER = '#F2A65A';
const LABEL_INNER = '#E2674A';

// CSS angle convention (0deg = up, clockwise) -> SVG objectBoundingBox points.
const gradientPoints = (angle) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  const dx = Math.cos(rad) / 2;
  const dy = Math.sin(rad) / 2;
  return {
    x1: 0.5 - dx,
    y1: 0.5 - dy,
    x2: 0.5 + dx,
    y2: 0.5 + dy,
  };
};

// ---------------------------------------------------------------------------
// Task 1: fallback artwork tiles (gradient + sheen + music note)
// ---------------------------------------------------------------------------

const paletteSvg = ({ colors, angle }, size = 512) => {
  const { x1, y1, x2, y2 } = gradientPoints(angle);
  const noteSize = size * 0.42;
  const scale = noteSize / 24;
  const offset = (size - noteSize) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${colors[0]}"/>
      <stop offset="1" stop-color="${colors[1]}"/>
    </linearGradient>
    <radialGradient id="sheen" cx="0.3" cy="0.22" r="0.58">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <rect width="${size}" height="${size}" fill="url(#sheen)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="#FFFCF5" stroke-opacity="0.65" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </g>
</svg>`;
};

// ---------------------------------------------------------------------------
// Task 2: vinyl disc app icon set
// ---------------------------------------------------------------------------

// Pie slice path, 0deg = up, clockwise (same as VinylDisc.tsx).
const pieSlice = (cx, cy, r, fromDeg, toDeg) => {
  const point = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return `${cx + r * Math.sin(rad)} ${cy - r * Math.cos(rad)}`;
  };
  return `M ${cx} ${cy} L ${point(fromDeg)} A ${r} ${r} 0 0 1 ${point(toDeg)} Z`;
};

// Vinyl disc fragment; proportions from the in-app VinylDisc (122-unit base).
const discFragment = (cx, cy, R) => {
  const k = R / 61;
  const grooveWidth = Math.max(1.5, k);
  const grooves = [40, 47, 54]
    .map(
      (r) =>
        `<circle cx="${cx}" cy="${cy}" r="${r * k}" fill="none" stroke="rgba(255,250,240,0.06)" stroke-width="${grooveWidth}"/>`,
    )
    .join('\n  ');
  return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${DISC}"/>
  ${grooves}
  <circle cx="${cx}" cy="${cy}" r="${36 * k}" fill="${LABEL_OUTER}"/>
  <circle cx="${cx}" cy="${cy}" r="${23 * k}" fill="${LABEL_INNER}"/>
  <circle cx="${cx}" cy="${cy}" r="${6 * k}" fill="${CREAM}"/>
  <path d="${pieSlice(cx, cy, R, 210, 248)}" fill="rgba(255,255,255,0.14)"/>`;
};

const svgDoc = (size, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${body}
</svg>`;

const iconSvg = (size = 1024) => {
  const c = size / 2;
  const R = (size * 0.72) / 2;
  return svgDoc(
    size,
    `<defs>
    <radialGradient id="glow" cx="0.5" cy="0" r="0.7">
      <stop offset="0" stop-color="#F2A65A" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#F2A65A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="${CREAM}"/>
  <rect width="${size}" height="${size}" fill="url(#glow)"/>
  ${discFragment(c, c, R)}`,
  );
};

const foregroundSvg = (size = 1024) =>
  svgDoc(size, discFragment(size / 2, size / 2, (size * 0.6) / 2));

const backgroundSvg = (size = 1024) =>
  svgDoc(size, `<rect width="${size}" height="${size}" fill="${CREAM}"/>`);

const monochromeSvg = (size = 1024) => {
  const c = size / 2;
  const R = (size * 0.6) / 2;
  const hole = (6 / 61) * R;
  const ring = (r) =>
    `M ${c - r} ${c} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  return svgDoc(
    size,
    `<path fill="#FFFFFF" fill-rule="evenodd" d="${ring(R)} ${ring(hole)}"/>`,
  );
};

const splashSvg = (size = 512) =>
  svgDoc(size, discFragment(size / 2, size / 2, size / 2 - 2));

// ---------------------------------------------------------------------------

const render = async (svg, file, resize) => {
  let img = sharp(Buffer.from(svg));
  if (resize) img = img.resize(resize, resize);
  const info = await img.png().toFile(file);
  console.log(`${path.relative(root, file)}  ${info.width}x${info.height}  ${info.size} bytes`);
};

await mkdir(artDir, { recursive: true });

for (let i = 0; i < PALETTES.length; i++) {
  await render(paletteSvg(PALETTES[i]), path.join(artDir, `palette-${i}.png`));
}

await render(iconSvg(), path.join(assets, 'icon.png'));
await render(foregroundSvg(), path.join(assets, 'android-icon-foreground.png'));
await render(backgroundSvg(), path.join(assets, 'android-icon-background.png'));
await render(monochromeSvg(), path.join(assets, 'android-icon-monochrome.png'));
await render(splashSvg(), path.join(assets, 'splash-icon.png'));
await render(iconSvg(), path.join(assets, 'favicon.png'), 48);

console.log('Done.');
