// Generate og.png with sharp (install: `bun add -d sharp`)
// Run: `bun run scripts/generate-og.mjs`
import sharp from 'sharp';
import { resolve } from 'path';

const W = 1200, H = 630;
const BG = '#0d1117';
const TEAL = '#55dad0';
const PANEL = '#0f141b';
const DIM = '#21262d';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="tealGrad" x1="0" y1="0" x2="${W}" y2="0">
      <stop offset="0%" stop-color="${TEAL}"/>
      <stop offset="100%" stop-color="#7aa2f7"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <!-- Top accent bar -->
  <rect width="${W}" height="4" fill="${TEAL}"/>
  <!-- Left accent line -->
  <rect x="0" y="0" width="4" height="120" fill="${TEAL}"/>
  <!-- Bottom accent line -->
  <rect y="${H-4}" width="${W}" height="4" fill="${TEAL}"/>

  <!-- Terminal window frame -->
  <rect x="140" y="180" width="920" height="30" rx="4" ry="4" fill="${PANEL}"/>
  <!-- Window dots -->
  <circle cx="160" cy="195" r="8" fill="#f7768e"/>
  <circle cx="190" cy="195" r="8" fill="#e0af68"/>
  <circle cx="220" cy="195" r="8" fill="#9ece6a"/>

  <!-- Terminal body -->
  <rect x="140" y="210" width="920" height="240" rx="0" ry="0" fill="${BG}" stroke="${DIM}" stroke-width="1"/>

  <!-- Prompt "> gtm" -->
  <text x="160" y="235" font-family="JetBrains Mono, monospace" font-weight="800" font-size="14" fill="${TEAL}">> gtm</text>
  <!-- Cursor block -->
  <rect x="210" y="222" width="12" height="18" fill="${TEAL}"/>

  <!-- Spectrum bars (decorative) -->
  <g fill="${TEAL}">
    <rect x="160" y="380" width="12" height="80"/>
    <rect x="180" y="415" width="12" height="45"/>
    <rect x="200" y="350" width="12" height="110"/>
    <rect x="220" y="430" width="12" height="30"/>
    <rect x="240" y="370" width="12" height="90"/>
    <rect x="260" y="405" width="12" height="55"/>
    <rect x="280" y="355" width="12" height="105"/>
    <rect x="300" y="435" width="12" height="25"/>
    <rect x="320" y="390" width="12" height="70"/>
    <rect x="340" y="345" width="12" height="115"/>
    <rect x="360" y="420" width="12" height="40"/>
    <rect x="380" y="365" width="12" height="95"/>
  </g>

  <!-- Brand text -->
  <text x="${W/2}" y="${H-100}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="800" font-size="48" fill="${TEAL}">> gtm</text>
  <text x="${W/2}" y="${H-50}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="500" font-size="20" fill="#c9d1d9">Documentation</text>
</svg>
`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(resolve('public/og.png'));

console.log('✓ public/og.png generated');