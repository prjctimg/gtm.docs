import React from 'react';

export const MusicalDoodleBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Soft gradient spotlights to blend with obsidian theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 left-1/4 w-[350px] h-[250px] bg-primary-container/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-[400px] h-[250px] bg-accent-purple/5 rounded-full blur-2xl pointer-events-none" />

      {/* SVG Canvas with Hand-Drawn Musical Doodles & Instruments */}
      <svg
        className="w-full h-full opacity-35 sm:opacity-40 transition-opacity duration-700"
        viewBox="0 0 1440 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle glow filter for select doodle highlights */}
          <filter id="doodle-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Radial mask to keep text in center clear and readable */}
          <radialGradient id="hero-center-mask" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.18" />
            <stop offset="45%" stopColor="white" stopOpacity="0.45" />
            <stop offset="85%" stopColor="white" stopOpacity="0.95" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>

          <mask id="doodle-mask">
            <rect width="100%" height="100%" fill="url(#hero-center-mask)" />
          </mask>
        </defs>

        <g mask="url(#doodle-mask)">
          {/* ============================================================ */}
          {/* 1. WAVING MUSICAL STAVES (Flowing Background Waves)          */}
          {/* ============================================================ */}
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-hairline-outline/70">
            {/* Top-left to center-left flowing 5-line staff */}
            <path d="M-40,120 C120,90 220,180 380,140 C480,115 540,135 600,165" />
            <path d="M-40,130 C120,100 220,190 380,150 C480,125 540,145 600,175" />
            <path d="M-40,140 C120,110 220,200 380,160 C480,135 540,155 600,185" />
            <path d="M-40,150 C120,120 220,210 380,170 C480,145 540,165 600,195" />
            <path d="M-40,160 C120,130 220,220 380,180 C480,155 540,175 600,205" />

            {/* Bottom-right wavy staff */}
            <path d="M940,510 C1080,480 1200,560 1480,500" />
            <path d="M940,520 C1080,490 1200,570 1480,510" />
            <path d="M940,530 C1080,500 1200,580 1480,520" />
            <path d="M940,540 C1080,510 1200,590 1480,530" />
            <path d="M940,550 C1080,520 1200,600 1480,540" />
          </g>

          {/* ============================================================ */}
          {/* 2. LEFT SIDE INSTRUMENTS & ELEMENTS                          */}
          {/* ============================================================ */}
          
          {/* INSTRUMENT: Electric / Acoustic Guitar Doodle (Top Left) */}
          <g
            transform="translate(100, 60) rotate(-18)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary/70"
          >
            {/* Guitar Body */}
            <path
              d="M50,140 C35,110 40,80 65,70 C85,60 100,85 110,105 C120,85 135,60 155,70 C180,80 185,110 170,140 C195,180 185,230 150,250 C125,262 95,262 70,250 C35,230 25,180 50,140 Z"
              strokeWidth="2"
              fill="currentColor"
              fillOpacity="0.04"
            />
            {/* Soundhole */}
            <circle cx="110" cy="155" r="22" strokeWidth="1.8" />
            <circle cx="110" cy="155" r="6" strokeWidth="1.2" fill="currentColor" fillOpacity="0.3" />
            {/* Bridge */}
            <path d="M92,215 L128,215" strokeWidth="3" />
            {/* Neck */}
            <path d="M102,72 L102,-35 L118,-35 L118,72" strokeWidth="1.8" />
            {/* Frets */}
            <path d="M102,-15 L118,-15 M102,5 L118,5 M102,25 L118,25 M102,45 L118,45" strokeWidth="1.2" />
            {/* Headstock & Tuning Pegs */}
            <path d="M98,-35 L98,-65 C105,-72 115,-72 122,-65 L122,-35 Z" strokeWidth="1.8" />
            <circle cx="92" cy="-58" r="2.5" strokeWidth="1.2" />
            <circle cx="92" cy="-44" r="2.5" strokeWidth="1.2" />
            <circle cx="128" cy="-58" r="2.5" strokeWidth="1.2" />
            <circle cx="128" cy="-44" r="2.5" strokeWidth="1.2" />
            {/* Little sound doodle lines */}
            <path d="M190,120 C205,125 210,140 205,155" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M200,105 C220,115 225,145 218,170" strokeWidth="1.5" strokeDasharray="3 4" />
          </g>

          {/* INSTRUMENT: Retro Cassette Tape (Mid Left) */}
          <g
            transform="translate(65, 340) rotate(12)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-container/70"
          >
            {/* Outer shell */}
            <rect x="0" y="0" width="130" height="82" rx="7" strokeWidth="2" fill="currentColor" fillOpacity="0.04" />
            {/* Label area */}
            <rect x="14" y="10" width="102" height="42" rx="3" strokeWidth="1.4" />
            {/* Tape window */}
            <rect x="34" y="20" width="62" height="22" rx="3" strokeWidth="1.4" />
            {/* Left spool */}
            <circle cx="48" cy="31" r="7" strokeWidth="1.6" />
            <circle cx="48" cy="31" r="2" fill="currentColor" />
            <path d="M48,24 L48,27 M48,35 L48,38 M41,31 L44,31 M52,31 L55,31" strokeWidth="1.2" />
            {/* Right spool */}
            <circle cx="82" cy="31" r="7" strokeWidth="1.6" />
            <circle cx="82" cy="31" r="2" fill="currentColor" />
            <path d="M82,24 L82,27 M82,35 L82,38 M75,31 L78,31 M86,31 L89,31" strokeWidth="1.2" />
            {/* Bottom trapezoid */}
            <path d="M26,82 L38,62 L92,62 L104,82" strokeWidth="1.4" />
            <circle cx="44" cy="72" r="2" fill="currentColor" />
            <circle cx="86" cy="72" r="2" fill="currentColor" />
          </g>

          {/* INSTRUMENT: Snare Drum & Crossed Drumsticks (Far Bottom Left) */}
          <g
            transform="translate(180, 480) rotate(-8)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-purple/70"
          >
            {/* Drum Rim & Body */}
            <ellipse cx="60" cy="30" rx="55" ry="18" strokeWidth="2" fill="currentColor" fillOpacity="0.04" />
            <path d="M5,30 L5,75 C5,88 30,96 60,96 C90,96 115,88 115,75 L115,30" strokeWidth="2" />
            {/* Tuning Lugs / Tension Rods */}
            <path d="M20,38 L20,83 M45,43 L45,91 M75,43 L75,91 M100,38 L100,83" strokeWidth="1.5" />
            {/* Crossed Drumsticks */}
            <path d="M-10,0 L95,85" strokeWidth="2.5" />
            <circle cx="-10" cy="0" r="3.5" fill="currentColor" />
            <path d="M125,-5 L20,95" strokeWidth="2.5" />
            <circle cx="125" cy="-5" r="3.5" fill="currentColor" />
            {/* Drum hit vibration sparks */}
            <path d="M55,10 L50,0 M65,10 L70,0 M60,8 L60,-4" strokeWidth="1.5" />
          </g>

          {/* ============================================================ */}
          {/* 3. RIGHT SIDE INSTRUMENTS & ELEMENTS                         */}
          {/* ============================================================ */}

          {/* INSTRUMENT: Vinyl Record with Tonearm (Top Right) */}
          <g
            transform="translate(1180, 50) rotate(15)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary/70"
          >
            {/* Vinyl Outer Rim */}
            <circle cx="100" cy="100" r="85" strokeWidth="2.2" fill="currentColor" fillOpacity="0.03" />
            {/* Grooves */}
            <circle cx="100" cy="100" r="74" strokeWidth="1" strokeDasharray="7 4" opacity="0.6" />
            <circle cx="100" cy="100" r="63" strokeWidth="1" opacity="0.5" />
            <circle cx="100" cy="100" r="52" strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
            {/* Center Label */}
            <circle cx="100" cy="100" r="32" strokeWidth="1.6" fill="currentColor" fillOpacity="0.1" />
            <circle cx="100" cy="100" r="8" strokeWidth="1.4" fill="currentColor" fillOpacity="0.4" />
            {/* Tonearm */}
            <path d="M185,25 L165,25 C160,25 150,55 135,80 L125,92" strokeWidth="2.2" />
            <rect x="180" y="18" width="14" height="14" rx="3" strokeWidth="1.5" />
            <rect x="119" y="88" width="8" height="12" rx="2" strokeWidth="1.5" transform="rotate(35 123 94)" />
            {/* Musical spark */}
            <path d="M175,125 C185,130 190,140 188,152" strokeWidth="1.4" strokeDasharray="2 3" />
          </g>

          {/* INSTRUMENT: Saxophone Doodle (Mid-Right) */}
          <g
            transform="translate(1220, 290) rotate(-14)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-state-warning/80"
          >
            {/* Neck & Mouthpiece */}
            <path d="M25,20 C35,15 48,22 45,35 L40,90" strokeWidth="2" />
            <path d="M22,22 L14,18" strokeWidth="2.5" />
            {/* Main Body Tube */}
            <path d="M40,90 C42,145 45,185 45,210 C45,245 75,260 100,245 C120,230 125,190 125,160" strokeWidth="2.2" />
            <path d="M52,90 C54,145 56,180 56,205 C56,230 76,242 95,230 C110,220 114,190 114,160" strokeWidth="1.6" />
            {/* Flared Bell */}
            <path d="M114,160 C114,130 135,115 155,112 C168,110 175,120 170,140 C162,165 135,175 125,160" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
            {/* Keys along the tube */}
            <circle cx="36" cy="110" r="3.5" strokeWidth="1.4" />
            <circle cx="37" cy="130" r="3.5" strokeWidth="1.4" />
            <circle cx="38" cy="150" r="3.5" strokeWidth="1.4" />
            <circle cx="39" cy="170" r="3.5" strokeWidth="1.4" />
            {/* Rod connecting keys */}
            <path d="M48,105 L50,175" strokeWidth="1.2" />
            {/* Melody notes floating out of bell */}
            <path d="M175,100 Q190,85 205,95" strokeWidth="1.4" strokeDasharray="3 3" />
          </g>

          {/* INSTRUMENT: Over-Ear DJ Headphones (Bottom Right) */}
          <g
            transform="translate(1060, 440) rotate(10)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-container/70"
          >
            {/* Headband arch */}
            <path d="M20,95 C15,20 115,20 110,95" strokeWidth="3" />
            <path d="M28,85 C25,32 105,32 102,85" strokeWidth="1.2" strokeDasharray="4 3" />
            {/* Left earcup */}
            <rect x="6" y="85" width="22" height="38" rx="8" strokeWidth="2" fill="currentColor" fillOpacity="0.06" />
            <rect x="2" y="93" width="6" height="22" rx="3" strokeWidth="1.5" />
            {/* Right earcup */}
            <rect x="102" y="85" width="22" height="38" rx="8" strokeWidth="2" fill="currentColor" fillOpacity="0.06" />
            <rect x="122" y="93" width="6" height="22" rx="3" strokeWidth="1.5" />
            {/* Cord doodle with jack */}
            <path d="M17,123 C17,145 35,160 55,145 C75,130 90,165 110,165" strokeWidth="1.5" />
            {/* Sound waves from earcups */}
            <path d="M-5,92 C-12,98 -12,110 -5,116" strokeWidth="1.6" />
            <path d="M-12,85 C-22,96 -22,118 -12,126" strokeWidth="1.4" />
            <path d="M135,92 C142,98 142,110 135,116" strokeWidth="1.6" />
            <path d="M142,85 C152,96 152,118 142,126" strokeWidth="1.4" />
          </g>

          {/* ============================================================ */}
          {/* 4. KEYBOARD / SYNTH PIANO KEYS (Bottom Center / Left)       */}
          {/* ============================================================ */}
          <g
            transform="translate(480, 530) rotate(-4)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary/60"
          >
            {/* Keyboard Frame */}
            <rect x="0" y="0" width="180" height="60" rx="5" strokeWidth="2" fill="currentColor" fillOpacity="0.04" />
            {/* White Keys */}
            <path d="M15,0 L15,60 M30,0 L30,60 M45,0 L45,60 M60,0 L60,60 M75,0 L75,60 M90,0 L90,60 M105,0 L105,60 M120,0 L120,60 M135,0 L135,60 M150,0 L150,60 M165,0 L165,60" strokeWidth="1.3" />
            {/* Black Keys */}
            <rect x="10" y="0" width="9" height="34" rx="1" fill="currentColor" fillOpacity="0.75" />
            <rect x="25" y="0" width="9" height="34" rx="1" fill="currentColor" fillOpacity="0.75" />
            <rect x="55" y="0" width="9" height="34" rx="1" fill="currentColor" fillOpacity="0.75" />
            <rect x="70" y="0" width="9" height="34" rx="1" fill="currentColor" fillOpacity="0.75" />
            <rect x="85" y="0" width="9" height="34" rx="1" fill="currentColor" fillOpacity="0.75" />
            <rect x="115" y="0" width="9" height="34" rx="1" fill="currentColor" fillOpacity="0.75" />
            <rect x="130" y="0" width="9" height="34" rx="1" fill="currentColor" fillOpacity="0.75" />
            <rect x="160" y="0" width="9" height="34" rx="1" fill="currentColor" fillOpacity="0.75" />
            {/* Synth Knobs & Sliders atop */}
            <circle cx="40" cy="-12" r="5" strokeWidth="1.3" />
            <circle cx="65" cy="-12" r="5" strokeWidth="1.3" />
            <circle cx="90" cy="-12" r="5" strokeWidth="1.3" />
            <path d="M115,-17 L115,-7 M112,-12 L118,-12" strokeWidth="1.3" />
            <path d="M135,-17 L135,-7 M132,-15 L138,-15" strokeWidth="1.3" />
          </g>

          {/* INSTRUMENT: Vintage Broadcast Microphone (Top Center-Right) */}
          <g
            transform="translate(860, 45) rotate(12)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-coral/75"
          >
            {/* Mic capsule */}
            <rect x="10" y="0" width="30" height="50" rx="15" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
            {/* Grille lines */}
            <path d="M10,20 L40,20 M10,30 L40,30 M25,0 L25,50" strokeWidth="1.2" />
            {/* U-shaped mount */}
            <path d="M4,28 C4,52 46,52 46,28" strokeWidth="2" />
            {/* Stand base */}
            <path d="M25,52 L25,75 M12,75 L38,75" strokeWidth="2.2" />
            {/* On-air sound sparkles */}
            <path d="M48,8 L55,4 M50,18 L58,18 M48,28 L55,32" strokeWidth="1.4" />
          </g>

          {/* ============================================================ */}
          {/* 5. MUSICAL SYMBOLS & NOTATION DOODLES                       */}
          {/* ============================================================ */}

          {/* LARGE TREBLE CLEF (Upper Left Area) */}
          <g
            transform="translate(260, 40) rotate(-6)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary/80"
          >
            <path
              d="M32,125 C25,120 22,110 26,102 C30,94 40,96 42,105 C43,115 32,124 22,114 C12,102 18,80 34,60 C48,42 42,15 35,0 C32,25 32,80 32,140 C32,165 24,175 14,170 C6,166 8,155 16,155 C22,155 24,162 20,166"
              strokeWidth="2.5"
            />
          </g>

          {/* BASS CLEF (Far Right Upper Area) */}
          <g
            transform="translate(1070, 110) rotate(8)"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-container/80"
          >
            <circle cx="16" cy="18" r="5" fill="currentColor" strokeWidth="1" />
            <path
              d="M16,23 C28,24 44,35 44,52 C44,70 30,86 10,95"
              strokeWidth="2.6"
            />
            <circle cx="52" cy="38" r="3" fill="currentColor" />
            <circle cx="52" cy="56" r="3" fill="currentColor" />
          </g>

          {/* BEAMED EIGHTH NOTES (♫) (Scattered Floating Doodles) */}
          {/* Note 1: Left Mid */}
          <g transform="translate(180, 260) rotate(-15)" stroke="currentColor" strokeLinecap="round" className="text-secondary/75">
            <ellipse cx="12" cy="38" rx="8" ry="6" transform="rotate(-20 12 38)" fill="currentColor" strokeWidth="1.5" />
            <ellipse cx="44" cy="30" rx="8" ry="6" transform="rotate(-20 44 30)" fill="currentColor" strokeWidth="1.5" />
            <path d="M19,36 L19,6 M51,28 L51,-2" strokeWidth="2.2" />
            <path d="M18,7 L52,-1" strokeWidth="4.5" />
          </g>

          {/* Note 2: Bottom Center Left */}
          <g transform="translate(370, 420) rotate(18)" stroke="currentColor" strokeLinecap="round" className="text-accent-purple/75">
            <ellipse cx="10" cy="34" rx="7" ry="5.5" transform="rotate(-20 10 34)" fill="currentColor" strokeWidth="1.5" />
            <ellipse cx="38" cy="28" rx="7" ry="5.5" transform="rotate(-20 38 28)" fill="currentColor" strokeWidth="1.5" />
            <path d="M16,32 L16,8 M44,26 L44,2" strokeWidth="2" />
            <path d="M15,9 L45,3" strokeWidth="4" />
          </g>

          {/* Note 3: Top Right */}
          <g transform="translate(1000, 190) rotate(12)" stroke="currentColor" strokeLinecap="round" className="text-accent-coral/75">
            <ellipse cx="12" cy="36" rx="8" ry="6" transform="rotate(-20 12 36)" fill="currentColor" strokeWidth="1.5" />
            <ellipse cx="46" cy="26" rx="8" ry="6" transform="rotate(-20 46 26)" fill="currentColor" strokeWidth="1.5" />
            <path d="M19,34 L19,8 M53,24 L53,-2" strokeWidth="2.2" />
            <path d="M18,9 L54,-1" strokeWidth="4" />
            <path d="M18,17 L54,7" strokeWidth="3" /> {/* 16th double beam */}
          </g>

          {/* Note 4: Bottom Right */}
          <g transform="translate(940, 420) rotate(-10)" stroke="currentColor" strokeLinecap="round" className="text-state-warning/75">
            <ellipse cx="10" cy="32" rx="7" ry="5" transform="rotate(-20 10 32)" fill="currentColor" strokeWidth="1.5" />
            <ellipse cx="36" cy="24" rx="7" ry="5" transform="rotate(-20 36 24)" fill="currentColor" strokeWidth="1.5" />
            <path d="M16,30 L16,6 M42,22 L42,-2" strokeWidth="2" />
            <path d="M15,7 L43,-1" strokeWidth="3.8" />
          </g>

          {/* SINGLE QUARTER & EIGHTH NOTES WITH FLAGS (♪, ♩) */}
          <g transform="translate(80, 210) rotate(-8)" stroke="currentColor" strokeLinecap="round" className="text-secondary/70">
            <ellipse cx="10" cy="26" rx="7" ry="5.5" transform="rotate(-20 10 26)" fill="currentColor" strokeWidth="1.5" />
            <path d="M16,24 L16,2 C22,4 28,10 24,18" strokeWidth="2" />
          </g>

          <g transform="translate(320, 160) rotate(15)" stroke="currentColor" strokeLinecap="round" className="text-primary-container/70">
            <ellipse cx="8" cy="22" rx="6" ry="4.5" transform="rotate(-20 8 22)" fill="currentColor" strokeWidth="1.5" />
            <path d="M13,20 L13,0" strokeWidth="2" />
          </g>

          <g transform="translate(1130, 240) rotate(-12)" stroke="currentColor" strokeLinecap="round" className="text-secondary/70">
            <ellipse cx="9" cy="24" rx="7" ry="5" transform="rotate(-20 9 24)" fill="currentColor" strokeWidth="1.5" />
            <path d="M15,22 L15,0 C20,2 25,7 23,16" strokeWidth="2" />
          </g>

          <g transform="translate(1360, 180) rotate(22)" stroke="currentColor" strokeLinecap="round" className="text-accent-purple/70">
            <ellipse cx="8" cy="20" rx="6" ry="4.5" transform="rotate(-20 8 20)" fill="currentColor" strokeWidth="1.5" />
            <path d="M13,18 L13,2" strokeWidth="2" />
          </g>

          {/* MUSICAL ACCIDENTALS: Sharp (#), Flat (♭), Natural (♮) */}
          {/* Sharp symbol # (Left) */}
          <g transform="translate(230, 160) rotate(-10)" stroke="currentColor" strokeLinecap="round" className="text-state-warning/80">
            <path d="M8,4 L6,32 M18,2 L16,30" strokeWidth="1.8" />
            <path d="M2,14 L24,10 M0,24 L22,20" strokeWidth="2.4" />
          </g>

          {/* Sharp symbol # (Right) */}
          <g transform="translate(1220, 170) rotate(8)" stroke="currentColor" strokeLinecap="round" className="text-secondary/80">
            <path d="M8,4 L6,30 M18,2 L16,28" strokeWidth="1.8" />
            <path d="M2,12 L24,9 M0,22 L22,19" strokeWidth="2.4" />
          </g>

          {/* Flat symbol ♭ (Upper center left) */}
          <g transform="translate(420, 70) rotate(6)" stroke="currentColor" strokeLinecap="round" className="text-primary-container/80">
            <path d="M6,0 L6,30 C6,30 18,25 18,17 C18,10 6,14 6,18" strokeWidth="2" />
          </g>

          {/* Flat symbol ♭ (Far right) */}
          <g transform="translate(1380, 390) rotate(-15)" stroke="currentColor" strokeLinecap="round" className="text-accent-coral/80">
            <path d="M6,0 L6,28 C6,28 16,24 16,16 C16,10 6,14 6,18" strokeWidth="2" />
          </g>

          {/* Natural symbol ♮ (Upper right) */}
          <g transform="translate(780, 50) rotate(-6)" stroke="currentColor" strokeLinecap="round" className="text-secondary/70">
            <path d="M6,0 L6,24 L18,20 L18,36 M6,12 L18,8" strokeWidth="1.8" />
          </g>

          {/* Fermata symbol (𝄐) (Hold / Pause) */}
          <g transform="translate(560, 80) rotate(-4)" stroke="currentColor" strokeLinecap="round" className="text-accent-purple/80">
            <path d="M6,22 C8,8 30,8 32,22" strokeWidth="2" />
            <circle cx="19" cy="17" r="2.5" fill="currentColor" />
          </g>

          {/* Quarter rest symbol (squiggle) */}
          <g transform="translate(160, 170) rotate(10)" stroke="currentColor" strokeLinecap="round" className="text-text-muted/80">
            <path d="M6,4 L16,12 L8,18 C14,20 16,26 10,32" strokeWidth="2.2" />
          </g>

          {/* Repeat dots & double bar line doodle */}
          <g transform="translate(70, 450) rotate(5)" stroke="currentColor" strokeLinecap="round" className="text-hairline-outline">
            <path d="M10,6 L10,36" strokeWidth="1.5" />
            <path d="M15,6 L15,36" strokeWidth="3" />
            <circle cx="5" cy="16" r="2" fill="currentColor" />
            <circle cx="5" cy="26" r="2" fill="currentColor" />
          </g>

          {/* ============================================================ */}
          {/* 6. PLAYFUL DOODLE ACCENTS: Stars, sparkles, rhythm bursts    */}
          {/* ============================================================ */}
          {/* Doodle sparkle 1 */}
          <g transform="translate(300, 110)" stroke="currentColor" strokeLinecap="round" className="text-secondary/60">
            <path d="M10,0 L10,20 M0,10 L20,10 M4,4 L16,16 M16,4 L4,16" strokeWidth="1.4" />
          </g>

          {/* Doodle sparkle 2 */}
          <g transform="translate(1120, 360)" stroke="currentColor" strokeLinecap="round" className="text-state-warning/60">
            <path d="M8,0 L8,16 M0,8 L16,8 M3,3 L13,13 M13,3 L3,13" strokeWidth="1.3" />
          </g>

          {/* Doodle sparkle 3 */}
          <g transform="translate(1310, 80)" stroke="currentColor" strokeLinecap="round" className="text-accent-coral/60">
            <path d="M7,0 L7,14 M0,7 L14,7" strokeWidth="1.6" />
          </g>

          {/* Floating Soundwave Burst Doodle (Bottom Left) */}
          <g transform="translate(280, 520)" stroke="currentColor" strokeLinecap="round" className="text-secondary/50">
            <path d="M0,15 L6,6 L12,24 L18,0 L24,30 L30,8 L36,20 L42,15" strokeWidth="1.8" />
          </g>

          {/* Floating Soundwave Burst Doodle (Bottom Right) */}
          <g transform="translate(1260, 480)" stroke="currentColor" strokeLinecap="round" className="text-primary-container/50">
            <path d="M0,12 L8,4 L16,22 L24,2 L32,26 L40,8 L48,16 L56,12" strokeWidth="1.8" />
          </g>

          {/* FFT Spectrum Equalizer Bars Doodle (Top Center-Left) */}
          <g transform="translate(480, 30)" stroke="currentColor" strokeLinecap="round" className="text-text-muted/50">
            <path d="M0,25 L0,15 M6,25 L6,8 M12,25 L12,4 M18,25 L18,12 M24,25 L24,6 M30,25 L30,18" strokeWidth="2.5" />
          </g>
        </g>
      </svg>
    </div>
  );
};
