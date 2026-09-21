import React from 'react';

export const DoodleBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Soft ambient gradient orbs - enhanced on mobile for rich depth */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-secondary/10 sm:bg-secondary/5 rounded-full blur-3xl pointer-events-none"
      />
      <div
        className="absolute top-6 left-6 sm:left-12 w-[260px] h-[200px] bg-primary-container/10 sm:bg-primary-container/5 rounded-full blur-2xl pointer-events-none"
      />
      <div
        className="absolute bottom-6 right-6 sm:right-12 w-[280px] h-[200px] bg-accent-purple/10 sm:bg-accent-purple/5 rounded-full blur-2xl pointer-events-none"
      />

      {/* SVG Canvas - significantly more vibrant and visible on mobile (opacity-65 vs opacity-35) */}
      <svg
        className="w-full h-full opacity-65 sm:opacity-45 md:opacity-50 transition-opacity duration-500"
        viewBox="0 0 1440 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <style>{`
            /* Floating bobbing animations with local center origin */
            @keyframes doodleBob1 {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-7px) rotate(3deg); }
            }
            @keyframes doodleBob2 {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(6px) rotate(-3deg); }
            }
            @keyframes doodleBob3 {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(-2deg); }
            }

            /* Vinyl rotation */
            @keyframes vinylSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            /* Sound wave pulsating */
            @keyframes wavePulse {
              0%, 100% { opacity: 0.45; transform: scaleY(0.9); }
              50% { opacity: 1; transform: scaleY(1.15); }
            }

            /* Sparkle twinkle */
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; transform: scale(0.85); }
              50% { opacity: 1; transform: scale(1.25); }
            }

            /* Staff wave flow */
            @keyframes staffFlow {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -80; }
            }

            .anim-bob-1 {
              transform-box: fill-box;
              transform-origin: center;
              animation: doodleBob1 6.5s ease-in-out infinite;
            }
            .anim-bob-2 {
              transform-box: fill-box;
              transform-origin: center;
              animation: doodleBob2 7.5s ease-in-out infinite;
            }
            .anim-bob-3 {
              transform-box: fill-box;
              transform-origin: center;
              animation: doodleBob3 5.5s ease-in-out infinite;
            }
            .anim-vinyl {
              transform-box: fill-box;
              transform-origin: center;
              animation: vinylSpin 24s linear infinite;
            }
            .anim-pulse {
              transform-box: fill-box;
              transform-origin: center;
              animation: wavePulse 3s ease-in-out infinite;
            }
            .anim-sparkle {
              transform-box: fill-box;
              transform-origin: center;
              animation: twinkle 3.5s ease-in-out infinite;
            }
            .anim-staff {
              stroke-dasharray: 12 8;
              animation: staffFlow 20s linear infinite;
            }

            /* On mobile, greatly reduce mask dimming so doodles are immediately visible */
            @media (max-width: 640px) {
              .hero-mask-stop-1 {
                stop-opacity: 0.60 !important;
              }
              .hero-mask-stop-2 {
                stop-opacity: 0.85 !important;
              }
              .hero-mask-stop-3 {
                stop-opacity: 1 !important;
              }
            }
          `}</style>

          {/* Mask to balance text contrast while preserving mobile doodle visibility */}
          <radialGradient id="hero-clearance-mask" cx="50%" cy="45%" r="45%">
            <stop offset="0%" stopColor="white" stopOpacity="0.10" className="hero-mask-stop-1" />
            <stop offset="50%" stopColor="white" stopOpacity="0.40" className="hero-mask-stop-2" />
            <stop offset="85%" stopColor="white" stopOpacity="0.95" className="hero-mask-stop-3" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>

          <mask id="hero-doodle-mask">
            <rect width="100%" height="100%" fill="url(#hero-clearance-mask)" />
          </mask>
        </defs>

        <g mask="url(#hero-doodle-mask)">
          {/* ========================================== */}
          {/* 1. FLOWING MUSICAL STAVES (Background)    */}
          {/* ========================================== */}
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-hairline-outline/70 anim-staff">
            {/* Left flowing staff lines */}
            <path d="M-30,100 C120,80 240,140 400,110 C500,90 600,130 680,140" />
            <path d="M-30,110 C120,90 240,150 400,120 C500,100 600,140 680,150" />
            <path d="M-30,120 C120,100 240,160 400,130 C500,110 600,150 680,160" />
            <path d="M-30,130 C120,110 240,170 400,140 C500,120 600,160 680,170" />
            <path d="M-30,140 C120,120 240,180 400,150 C500,130 600,170 680,180" />

            {/* Right flowing staff lines */}
            <path d="M800,530 C940,500 1100,570 1470,520" />
            <path d="M800,540 C940,510 1100,580 1470,530" />
            <path d="M800,550 C940,520 1100,590 1470,540" />
            <path d="M800,560 C940,530 1100,600 1470,550" />
            <path d="M800,570 C940,540 1100,610 1470,560" />
          </g>

          {/* ========================================== */}
          {/* 2. MOBILE CENTRAL VIEWPORT DOODLES         */}
          {/* (Visible on narrow mobile 360-640px screens) */}
          {/* ========================================== */}

          {/* Treble Clef (Upper Center-Left, x: 490) */}
          <g transform="translate(485, 35)">
            <g className="anim-bob-1 text-secondary/80" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M22,95 C17,90 15,82 18,76 C21,70 28,72 30,78 C31,85 23,92 15,85 C7,76 12,58 23,44 C33,31 28,11 23,0 C21,18 21,58 21,104 C21,122 15,130 9,126 C3,123 5,115 11,115 C15,115 16,120 13,123"
                strokeWidth="2.2"
              />
            </g>
          </g>

          {/* Floating Beamed Notes (Upper Center-Right, x: 910) */}
          <g transform="translate(905, 55)">
            <g className="anim-bob-2 text-primary-container/85" stroke="currentColor" strokeLinecap="round">
              <ellipse cx="9" cy="28" rx="6.5" ry="5" transform="rotate(-20 9 28)" fill="currentColor" strokeWidth="1.4" />
              <ellipse cx="34" cy="20" rx="6.5" ry="5" transform="rotate(-20 34 20)" fill="currentColor" strokeWidth="1.4" />
              <path d="M15,26 L15,4 M40,18 L40,-2" strokeWidth="1.8" />
              <path d="M14,5 L41,-1" strokeWidth="3.5" />
            </g>
          </g>

          {/* Musical Sharp # (Left Center flank, x: 420) */}
          <g transform="translate(420, 190)">
            <g className="anim-bob-3 text-state-warning/80" stroke="currentColor" strokeLinecap="round">
              <path d="M6,2 L4,26 M14,0 L12,24" strokeWidth="1.8" />
              <path d="M0,10 L18,7 M-2,19 L16,16" strokeWidth="2.2" />
            </g>
          </g>

          {/* Musical Flat ♭ & Sparkle (Right Center flank, x: 990) */}
          <g transform="translate(990, 190)">
            <g className="anim-bob-1 text-accent-coral/85" stroke="currentColor" strokeLinecap="round">
              <path d="M5,0 L5,24 C5,24 14,20 14,14 C14,8 5,11 5,15" strokeWidth="1.8" />
            </g>
          </g>
          <g transform="translate(1015, 175)">
            <g className="anim-sparkle text-secondary/70" stroke="currentColor" strokeLinecap="round">
              <path d="M6,0 L6,12 M0,6 L12,6" strokeWidth="1.4" />
            </g>
          </g>

          {/* Sound Wave Ripple (Lower Center-Left, x: 460) */}
          <g transform="translate(460, 520)">
            <g className="anim-pulse text-secondary/70" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M0,18 C12,6 24,30 36,18 C48,6 60,30 72,18 C84,6 96,30 108,18" strokeWidth="1.8" />
            </g>
          </g>

          {/* Bass Clef (Lower Center-Right, x: 890) */}
          <g transform="translate(890, 480)">
            <g className="anim-bob-3 text-state-warning/80" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="12" r="3.5" fill="currentColor" strokeWidth="1" />
              <path d="M10,15 C18,16 28,24 28,36 C28,48 18,58 6,64" strokeWidth="2" />
              <circle cx="34" cy="24" r="2" fill="currentColor" />
              <circle cx="34" cy="36" r="2" fill="currentColor" />
            </g>
          </g>

          {/* Quarter Note & Sparkle (Center Flank, x: 540) */}
          <g transform="translate(540, 260)">
            <g className="anim-bob-2 text-primary-container/75" stroke="currentColor" strokeLinecap="round">
              <ellipse cx="8" cy="22" rx="6" ry="4.5" transform="rotate(-20 8 22)" fill="currentColor" strokeWidth="1.4" />
              <path d="M14,20 L14,2 C18,4 22,8 20,15" strokeWidth="1.8" />
            </g>
          </g>

          {/* Star Sparkle (Center, x: 720) */}
          <g transform="translate(710, 40)">
            <g className="anim-sparkle text-state-warning/75" stroke="currentColor" strokeLinecap="round">
              <path d="M8,0 L8,16 M0,8 L16,8 M3,3 L13,13 M13,3 L3,13" strokeWidth="1.3" />
            </g>
          </g>

          {/* ========================================== */}
          {/* 3. WIDE DESKTOP WINGS (x: 60-350 & 1050-1400) */}
          {/* ========================================== */}

          {/* Treble Clef (Far Left, x: 180) */}
          <g transform="translate(180, 50)">
            <g className="anim-bob-1 text-secondary/70" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M26,115 C20,110 18,100 22,93 C25,86 34,88 36,96 C37,105 27,113 18,104 C9,93 15,72 28,54 C40,38 34,14 28,0 C26,22 26,72 26,128 C26,150 19,160 11,155 C4,151 6,141 13,141 C18,141 20,147 16,151"
                strokeWidth="2.2"
              />
            </g>
          </g>

          {/* Beamed Eighth Notes (Left Mid, x: 90) */}
          <g transform="translate(90, 240)">
            <g className="anim-bob-2 text-secondary/75" stroke="currentColor" strokeLinecap="round">
              <ellipse cx="10" cy="34" rx="7" ry="5.5" transform="rotate(-20 10 34)" fill="currentColor" strokeWidth="1.4" />
              <ellipse cx="38" cy="26" rx="7" ry="5.5" transform="rotate(-20 38 26)" fill="currentColor" strokeWidth="1.4" />
              <path d="M16,32 L16,6 M44,24 L44,0" strokeWidth="2" />
              <path d="M15,7 L45,1" strokeWidth="4" />
            </g>
          </g>

          {/* Quarter Note & Sparkle (Far Left, x: 60) */}
          <g transform="translate(60, 140)">
            <g className="anim-bob-3 text-primary-container/70" stroke="currentColor" strokeLinecap="round">
              <ellipse cx="8" cy="24" rx="6.5" ry="5" transform="rotate(-20 8 24)" fill="currentColor" strokeWidth="1.4" />
              <path d="M14,22 L14,2 C19,4 24,9 21,17" strokeWidth="2" />
            </g>
          </g>

          {/* Sharp (#) Symbol (Left, x: 230) */}
          <g transform="translate(230, 180)">
            <g className="anim-bob-1 text-state-warning/70" stroke="currentColor" strokeLinecap="round">
              <path d="M6,2 L4,26 M14,0 L12,24" strokeWidth="1.8" />
              <path d="M0,10 L18,7 M-2,19 L16,16" strokeWidth="2.2" />
            </g>
          </g>

          {/* Retro Audio Waveform Doodle (Bottom Left, x: 120) */}
          <g transform="translate(120, 480)">
            <g className="anim-pulse text-secondary/60" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M0,20 L10,8 L20,32 L30,4 L40,36 L50,12 L60,26 L70,18 L80,22" strokeWidth="2" />
              <circle cx="80" cy="22" r="3" fill="currentColor" />
            </g>
          </g>

          {/* Star Sparkle (Left, x: 270) */}
          <g transform="translate(270, 120)">
            <g className="anim-sparkle text-secondary/60" stroke="currentColor" strokeLinecap="round">
              <path d="M8,0 L8,16 M0,8 L16,8 M3,3 L13,13 M13,3 L3,13" strokeWidth="1.3" />
            </g>
          </g>

          {/* Spinning Vinyl Record (Top Right, x: 1200) */}
          <g transform="translate(1200, 60)">
            <g className="text-secondary/70" stroke="currentColor" strokeLinecap="round">
              <g className="anim-vinyl">
                <circle cx="90" cy="90" r="75" strokeWidth="2" fill="currentColor" fillOpacity="0.04" />
                <circle cx="90" cy="90" r="64" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
                <circle cx="90" cy="90" r="52" strokeWidth="1" opacity="0.5" />
                <circle cx="90" cy="90" r="40" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                <circle cx="90" cy="90" r="26" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12" />
                <circle cx="90" cy="90" r="6" strokeWidth="1.2" fill="currentColor" />
              </g>
              <path d="M165,15 L148,15 C142,15 132,45 120,68 L110,78" strokeWidth="2" />
              <rect x="160" y="10" width="12" height="12" rx="2" strokeWidth="1.5" />
            </g>
          </g>

          {/* Bass Clef (Right Mid, x: 1080) */}
          <g transform="translate(1080, 160)">
            <g className="anim-bob-2 text-primary-container/75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="14" r="4" fill="currentColor" strokeWidth="1" />
              <path d="M12,18 C22,19 34,28 34,42 C34,56 22,68 8,75" strokeWidth="2.2" />
              <circle cx="42" cy="30" r="2.5" fill="currentColor" />
              <circle cx="42" cy="44" r="2.5" fill="currentColor" />
            </g>
          </g>

          {/* DJ Headphones (Far Bottom Right, x: 1220) */}
          <g transform="translate(1220, 440)">
            <g className="anim-bob-2 text-primary-container/65" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15,60 C12,12 88,12 85,60" strokeWidth="2.4" />
              <rect x="5" y="52" width="16" height="28" rx="6" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08" />
              <rect x="79" y="52" width="16" height="28" rx="6" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08" />
              <path d="M-2,58 C-6,62 -6,70 -2,74" strokeWidth="1.4" />
              <path d="M102,58 C106,62 106,70 102,74" strokeWidth="1.4" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
