import React from 'react';

export const SmkPatriaDharmaLogo: React.FC<{
  className?: string;
  size?: number;
  customSrc?: string;
}> = ({ className = '', size = 72, customSrc }) => {
  if (customSrc) {
    return (
      <div className={`flex flex-col items-center justify-center shrink-0 ${className}`}>
        <img
          src={customSrc}
          alt="Logo SMK Patria Dharma"
          style={{ maxHeight: size * 1.1, maxWidth: size }}
          className="object-contain drop-shadow-xs"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size * 1.1}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xs"
        role="img"
        aria-label="Logo SMK Patria Dharma"
      >
        {/* Outer Pentagon Shield */}
        <polygon
          points="50,4 96,28 82,90 18,90 4,28"
          fill="#FACC15"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Inner Pentagon Border */}
        <polygon
          points="50,9 91,31 78,85 22,85 9,31"
          fill="#FEF08A"
          stroke="#B45309"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Lotus Base / Leaves */}
        <path
          d="M32 78 C40 70 60 70 68 78 C60 82 40 82 32 78 Z"
          fill="#15803D"
          stroke="#0F172A"
          strokeWidth="1.2"
        />

        {/* Dharmachakra (Wheel of Dharma) */}
        <circle cx="50" cy="46" r="22" fill="#FEF9C3" stroke="#B45309" strokeWidth="2.5" />
        <circle cx="50" cy="46" r="15" fill="#FEF08A" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="50" cy="46" r="5" fill="#DC2626" stroke="#1E293B" strokeWidth="1.5" />

        {/* 8 Spokes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + 5 * Math.cos(rad);
          const y1 = 46 + 5 * Math.sin(rad);
          const x2 = 50 + 15 * Math.cos(rad);
          const y2 = 46 + 15 * Math.sin(rad);
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#B45309"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Center Torch / Flame */}
        <path
          d="M50 32 C47 38 48 42 50 44 C52 42 53 38 50 32 Z"
          fill="#EA580C"
          stroke="#7C2D12"
          strokeWidth="1"
        />

        {/* Banner Ribbon across bottom of shield */}
        <path
          d="M10 84 Q50 92 90 84 L94 92 Q50 100 6 92 Z"
          fill="#DC2626"
          stroke="#7F1D1D"
          strokeWidth="1.5"
        />
        <text
          x="50"
          y="91"
          textAnchor="middle"
          fontSize="4.2"
          fontWeight="bold"
          fill="#FFFFFF"
          fontFamily="sans-serif"
          letterSpacing="0.2"
        >
          SELATPANJANG
        </text>
      </svg>
      {/* SMK text below logo as seen in original */}
      <div className="text-[11px] font-black tracking-[0.25em] text-slate-900 mt-0.5 leading-none">
        S M K
      </div>
    </div>
  );
};

export const YayasanBuddhaLogo: React.FC<{
  className?: string;
  size?: number;
  customSrc?: string;
}> = ({ className = '', size = 72, customSrc }) => {
  if (customSrc) {
    return (
      <div className={`flex flex-col items-center justify-center shrink-0 ${className}`}>
        <img
          src={customSrc}
          alt="Logo Yayasan Buddha"
          style={{ maxHeight: size, maxWidth: size }}
          className="object-contain drop-shadow-xs"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xs"
        role="img"
        aria-label="Logo Yayasan Sosial Umat Beragama Buddha"
      >
        {/* Outer Circular Ring with gear/cog teeth marks */}
        <circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#0F172A"
          strokeWidth="1"
          strokeDasharray="2.5,2.5"
        />

        {/* Upper Arc Text simulation / text path */}
        <path id="textArcTop" d="M15,50 A35,35 0 1,1 85,50" fill="none" />
        <text fontSize="4.6" fontWeight="bold" fill="#0F172A" letterSpacing="0.3">
          <textPath href="#textArcTop" startOffset="50%" textAnchor="middle">
            YAYASAN SOSIAL UMAT BERAGAMA BUDDHA
          </textPath>
        </text>

        {/* Lower Arc Text */}
        <path id="textArcBottom" d="M85,52 A35,35 0 0,1 15,52" fill="none" />
        <text fontSize="5.2" fontWeight="bold" fill="#0F172A" letterSpacing="0.6">
          <textPath href="#textArcBottom" startOffset="50%" textAnchor="middle">
            SELATPANJANG
          </textPath>
        </text>

        {/* Inner Ring with Gold/Brown accents */}
        <circle cx="50" cy="50" r="28" fill="#F8FAFC" stroke="#B45309" strokeWidth="2" />

        {/* Wreath / Laurel Leaves */}
        <path
          d="M28 50 C28 62 40 70 50 71 C60 70 72 62 72 50 C68 58 58 64 50 64 C42 64 32 58 28 50 Z"
          fill="#16A34A"
          stroke="#14532D"
          strokeWidth="0.8"
        />

        {/* Center Stupa / Pagoda / Candle Flame */}
        <path
          d="M50 28 L54 36 L52 44 L56 50 L44 50 L48 44 L46 36 Z"
          fill="#DC2626"
          stroke="#7F1D1D"
          strokeWidth="1"
        />
        <circle cx="50" cy="27" r="2.5" fill="#FACC15" stroke="#B45309" strokeWidth="0.8" />

        {/* Small stars */}
        <polygon points="20,50 21.5,47 24,47 22,45 23,42 20,44 17,42 18,45 16,47 18.5,47" fill="#DC2626" />
        <polygon points="80,50 81.5,47 84,47 82,45 83,42 80,44 77,42 78,45 76,47 78.5,47" fill="#DC2626" />
      </svg>
    </div>
  );
};

