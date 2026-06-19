import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const dimensions = {
    sm: { width: 'w-14', height: 'h-14', textSize: 'text-lg', subSize: 'text-[9px]' },
    md: { width: 'w-36', height: 'h-36', textSize: 'text-3xl', subSize: 'text-xs' },
    lg: { width: 'w-56', height: 'h-56', textSize: 'text-4xl', subSize: 'text-sm' },
    xl: { width: 'w-72', height: 'h-72', textSize: 'text-5xl', subSize: 'text-lg' }
  };

  const current = dimensions[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} id="avast-logo-container">
      {/* Premium SVG - High Precision 3D Vector replication of the requested artwork */}
      <svg
        className={`${current.width} ${current.height}`}
        viewBox="0 0 450 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="avast-logo-svg"
      >
        <defs>
          {/* Main Outer Arch Gradient (Red -> Orange -> Gold Yellow) */}
          <linearGradient id="arch-gradient" x1="60" y1="280" x2="220" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E51C23" />      {/* Deep Red */}
            <stop offset="20%" stopColor="#EA3D2F" />     {/* Pinkish Red */}
            <stop offset="50%" stopColor="#F57C00" />     {/* Bright Orange */}
            <stop offset="80%" stopColor="#FFB300" />     {/* Golden Yellow */}
            <stop offset="100%" stopColor="#FFE082" />    {/* Light Yellow Highlight */}
          </linearGradient>

          {/* Under-to-Over Blue-Green Wave Gradient */}
          <linearGradient id="wave-gradient" x1="120" y1="240" x2="330" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1565C0" />      {/* Vivid Sapphire Blue */}
            <stop offset="25%" stopColor="#00AEEF" />     {/* Electric Cyan */}
            <stop offset="55%" stopColor="#00B0FF" />     {/* Mid Blue-Teal */}
            <stop offset="75%" stopColor="#00A651" />     {/* Rich Kelly Green */}
            <stop offset="100%" stopColor="#81C784" />    {/* Soft Light Green */}
          </linearGradient>

          {/* Golden Roller Metallic Cylinder Gradient */}
          <linearGradient id="gold-cylinder" x1="310" y1="0" x2="380" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5D3A0A" />      {/* Deep copper shadow */}
            <stop offset="15%" stopColor="#C69E4B" />     {/* Warm gold */}
            <stop offset="35%" stopColor="#F9E29D" />     {/* Bright metallic shine */}
            <stop offset="55%" stopColor="#FFF2CC" />     {/* Specular glow */}
            <stop offset="75%" stopColor="#D8AF50" />     {/* Brushed gold */}
            <stop offset="90%" stopColor="#8E5E1C" />     {/* Golden shadow */}
            <stop offset="100%" stopColor="#3E2405" />    {/* Terminating shadow */}
          </linearGradient>

          {/* Golden Spacer Capsule Gradient */}
          <linearGradient id="gold-spacer" x1="320" y1="125" x2="370" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5E3E0E" />
            <stop offset="30%" stopColor="#E3BB63" />
            <stop offset="50%" stopColor="#FFF1BE" />
            <stop offset="70%" stopColor="#D5AA4B" />
            <stop offset="100%" stopColor="#5E3E0E" />
          </linearGradient>

          {/* Coiled Spiral Outer Shield Gradient */}
          <radialGradient id="spiral-base-grad" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
            <stop offset="0%" stopColor="#0288D1" />      {/* Sky Blue */}
            <stop offset="45%" stopColor="#1565C0" />     {/* Cobalt Blue */}
            <stop offset="85%" stopColor="#0D1B2A" />     {/* Midnight Navy */}
            <stop offset="100%" stopColor="#04080A" />    {/* Outer Shadow Rim */}
          </radialGradient>

          {/* Inner Golden Spiral Core Line */}
          <linearGradient id="spiral-gold-line" x1="290" y1="180" x2="390" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE082" />      {/* Highlight core */}
            <stop offset="50%" stopColor="#D4AF37" />     {/* Gold leaf */}
            <stop offset="100%" stopColor="#8C6615" />    {/* Antique bronze */}
          </linearGradient>

          {/* Realistic 3D drop-shadow effects */}
          <filter id="ultra-drop-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="3" dy="14" stdDeviation="10" floodColor="#000000" floodOpacity="0.85" />
          </filter>

          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 3D Visual Group with Master Shadows */}
        <g filter="url(#ultra-drop-shadow)">
          
          {/* LAYER 1: BACK SWOOPING TEAL/BLUE RIBBON FOLD (The continuous infinite loop back layer) */}
          <path
            d="M 120,250 
               C 150,195 210,145 250,175
               C 275,195 240,245 190,250
               C 150,254 135,230 150,205
               C 175,160 230,110 265,115
               C 290,118 295,145 275,175"
            stroke="url(#wave-gradient)"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.85"
          />

          {/* LAYER 2: PRIMARY RED-ORANGE-GOLD ARCH ("A" shape main left leg & top peak) */}
          <path
            d="M 85,255 
               C 125,170 160,65 215,80
               C 260,92 260,160 215,200
               C 180,230 140,250 95,260"
            stroke="url(#arch-gradient)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* LAYER 3: INNER GOLDEN GLOW RIBBON (Vibrant orange highlight inside the left leg) */}
          <path
            d="M 115,235 
               C 145,160 175,95 212,105
               C 235,112 240,150 210,180"
            stroke="#FFA726"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
            filter="url(#soft-glow)"
          />

          {/* LAYER 4: FRONT CYLE/WAVE PORTION (Rich green sweep moving up block to the right cylinder) */}
          <path
            d="M 230,190 
               C 255,160 280,105 310,110
               C 328,113 335,130 320,155
               C 295,195 255,225 220,220"
            stroke="url(#wave-gradient)"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.95"
          />

          {/* LAYER 5: THE GOLDEN METALLIC ROLLER (The high-fidelity printer roll symbol) */}
          <g transform="translate(10, 4)">
            {/* Cylinder shadow cap */}
            <rect x="310" y="86" width="60" height="24" rx="6" fill="#3D2405" opacity="0.6" />
            {/* Main polished golden roller body */}
            <rect x="310" y="84" width="60" height="24" rx="5" fill="url(#gold-cylinder)" stroke="#FFE082" strokeWidth="1" />
            {/* Internal 3D shadow crease */}
            <path d="M 312,102 C 330,106 350,106 368,102" stroke="#3E2405" strokeWidth="2" fill="none" opacity="0.4" />
          </g>

          {/* LAYER 6: THE SECONDARY GOLDEN SLIDER (The medium regulatory spacer capsule) */}
          <g transform="translate(10, 8)">
            {/* Spacer shadow base */}
            <rect x="318" y="122" width="44" height="11" rx="4" fill="#3D2405" opacity="0.5" />
            {/* Polished gold spacer capsule */}
            <rect x="318" y="120" width="44" height="11" rx="3.5" fill="url(#gold-spacer)" stroke="#FFE082" strokeWidth="0.75" />
          </g>

          {/* LAYER 7: THE METALLIC COILED THERMAL SPIRAL ROLL (The majestic coiled '6' scroll emblem) */}
          <g transform="translate(0, 16)">
            {/* Outer Deep Cobalt base layer with thick golden rim */}
            <circle cx="345" cy="200" r="36" fill="url(#spiral-base-grad)" stroke="url(#spiral-gold-line)" strokeWidth="4.5" />
            
            {/* 3D Inner gold spiraled paper coil path */}
            <path
              d="M 345,200
                 A 20,20 0 1,0 365,200
                 A 14,14 0 1,0 351,189
                 A 8,8 0 1,0 342,201"
              stroke="url(#spiral-gold-line)"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* LAYER 8: DYNAMIC LIGHTING HIGHLIGHTS (Pristine flare beads for that high-end look) */}
          <circle cx="215" cy="80" r="5" fill="#FFFFFF" opacity="0.95" />
          <circle cx="350" cy="94" r="3.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="340" cy="226" r="2.5" fill="#FFFFFF" opacity="0.85" />
          
          {/* Sparkle diamond stars */}
          <polygon points="105,70 109,74 105,78 101,74" fill="#FFF8E1" opacity="0.8" />
          <polygon points="375,160 378,163 375,166 372,163" fill="#FFF8E1" opacity="0.9" />
        </g>
      </svg>

      {/* Corporate Typography styling perfectly matching the brand identity */}
      {size !== 'sm' && (
        <div className="text-center mt-4 select-none" id="avast-logo-text">
          <h1 
            className="font-display font-extrabold tracking-[0.02em] gold-text text-4xl sm:text-5xl" 
            style={{ 
              textShadow: '0 4px 15px rgba(0,0,0,0.85)',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 800
            }}
          >
            Avast
          </h1>
          <p 
            className="font-sans font-extrabold text-xs tracking-[0.45em] uppercase text-brand-gold mt-1.5"
            style={{
              fontFamily: '"Outfit", sans-serif',
              letterSpacing: '0.45em'
            }}
          >
            GRÁFICA
          </p>
        </div>
      )}
    </div>
  );
}

