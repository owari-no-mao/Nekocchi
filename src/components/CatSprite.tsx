import React, { useState, useEffect } from 'react';
import { CatEvolutionId, CAT_SPECIES } from '../types/cat';

interface CatSpriteProps {
  catId: CatEvolutionId;
  action: 'idle' | 'walk' | 'eat' | 'sleep' | 'happy' | 'sad' | 'sick' | 'naughty' | 'brush' | 'poop' | 'evolve';
  isSleeping?: boolean;
  isSick?: boolean;
  isNaughty?: boolean;
  eggTaps?: number;
  direction?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
}

export const CatSprite: React.FC<CatSpriteProps> = ({
  catId,
  action,
  isSleeping = false,
  isSick = false,
  isNaughty = false,
  eggTaps = 0,
  direction = 'right',
  className = '',
  onClick,
}) => {
  const [frame, setFrame] = useState(0);

  // 2-frame retro LCD sprite oscillation (approx 400ms per frame)
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 450);
    return () => clearInterval(timer);
  }, []);

  const species = CAT_SPECIES[catId] || CAT_SPECIES.cat_egg;
  const isEgg = species.stage === 'egg';

  // If egg, render interactive hatching egg
  if (isEgg) {
    const crackLevel = Math.min(4, Math.floor(eggTaps));
    const wobbleClass = eggTaps > 0 ? (frame === 0 ? '-rotate-3 translate-y-0.5' : 'rotate-3 -translate-y-0.5') : 'animate-bounce';

    return (
      <div
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform ${wobbleClass} ${className}`}
        title="タップしてたまごを温めよう！"
      >
        <svg viewBox="0 0 100 120" className="w-28 h-36 drop-shadow-md">
          {/* Egg Shell Base */}
          <ellipse cx="50" cy="65" rx="36" ry="46" fill="#F8FAFC" stroke="#1E293B" strokeWidth="4" />
          {/* Egg Patterns (Dots) */}
          <circle cx="36" cy="50" r="4.5" fill="#E2E8F0" />
          <circle cx="62" cy="58" r="6" fill="#CBD5E1" />
          <circle cx="44" cy="78" r="5" fill="#CBD5E1" />
          <circle cx="60" cy="85" r="3.5" fill="#E2E8F0" />
          {/* Cracks according to tap count */}
          {crackLevel >= 1 && (
            <path d="M 50 25 L 46 38 L 54 44 L 50 54" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          )}
          {crackLevel >= 2 && (
            <path d="M 32 60 L 42 66 L 38 74" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          )}
          {crackLevel >= 3 && (
            <path d="M 68 45 L 60 52 L 66 62" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          )}
          {crackLevel >= 4 && (
            <path d="M 45 80 L 52 86 L 58 82" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          )}
        </svg>

        <div className="mt-2 text-xs font-pixel px-2 py-0.5 bg-slate-900/10 rounded text-slate-800 animate-pulse">
          TAP! ({eggTaps}/5)
        </div>
      </div>
    );
  }

  // Pet Sprite Rendering based on species and status
  const flip = direction === 'left' ? 'scale-x-[-1]' : '';
  const bounce = action === 'walk' ? (frame === 0 ? '-translate-y-1' : 'translate-y-0') : frame === 0 ? '-translate-y-0.5' : 'translate-y-0.5';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center cursor-pointer transition-transform ${flip} ${bounce} ${className}`}
    >
      {/* Floating Status Emotes (Hearts, Zzz, Sweat, Hungry, Sick) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center gap-1 font-pixel text-xs">
        {isSleeping && (
          <span className="text-indigo-600 animate-bounce font-bold tracking-widest text-sm">
            {frame === 0 ? 'Z' : 'Zzz'}
          </span>
        )}
        {action === 'eat' && (
          <span className="text-red-500 animate-ping font-bold">♥</span>
        )}
        {action === 'happy' && (
          <span className="text-amber-500 font-bold animate-bounce">♪</span>
        )}
        {action === 'brush' && (
          <span className="text-sky-500 font-bold animate-spin">✦</span>
        )}
        {isSick && (
          <span className="text-purple-600 font-bold animate-pulse text-sm">💧×_×</span>
        )}
        {isNaughty && (
          <span className="text-amber-600 font-bold animate-bounce text-sm">⚡!!</span>
        )}
      </div>

      <svg viewBox="0 0 120 120" className="w-32 h-32 pixel-art drop-shadow-sm">
        {/* Render Cat Body Parts via procedural vector pixel styling */}
        <g stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
          {/* TAIL */}
          <path
            d={
              isSleeping
                ? 'M 40 90 Q 25 90 28 80 Q 32 75 42 78'
                : frame === 0
                ? 'M 35 85 Q 15 80 18 60 Q 22 55 28 62'
                : 'M 35 85 Q 12 70 20 52 Q 26 48 29 58'
            }
            fill={species.furColor}
          />

          {/* BACK LEGS & FEET */}
          <rect x="36" y="85" width="14" height="15" rx="5" fill={species.furColor} />
          <rect x="70" y="85" width="14" height="15" rx="5" fill={species.furColor} />

          {/* MAIN BODY */}
          {species.id === 'adult_chatora' ? (
            // Extra chubby body
            <ellipse cx="60" cy="76" rx="34" ry="24" fill={species.furColor} />
          ) : (
            <ellipse cx="60" cy="74" rx="28" ry="22" fill={species.furColor} />
          )}

          {/* SPECIES BODY PATTERNS (Tabby stripes / Calico spots / Tuxedo belly) */}
          {species.id === 'child_playful' || species.id === 'adult_mike' ? (
            // Calico spots
            <>
              <ellipse cx="50" cy="70" rx="8" ry="12" fill={species.patternColor || '#EA580C'} stroke="none" />
              <ellipse cx="70" cy="76" rx="6" ry="8" fill="#1E293B" stroke="none" />
              <ellipse cx="60" cy="80" rx="10" ry="12" fill="#FFFFFF" stroke="none" />
            </>
          ) : species.id === 'child_glutton' || species.id === 'adult_chatora' ? (
            // Tabby stripes
            <>
              <path d="M 44 68 Q 50 69 48 78" stroke={species.patternColor} strokeWidth="3" fill="none" />
              <path d="M 68 66 Q 64 74 69 80" stroke={species.patternColor} strokeWidth="3" fill="none" />
              <path d="M 56 65 Q 58 72 57 82" stroke={species.patternColor} strokeWidth="3" fill="none" />
            </>
          ) : species.id === 'adult_hachiware' ? (
            // White belly
            <ellipse cx="60" cy="78" rx="14" ry="16" fill="#FFFFFF" stroke="none" />
          ) : species.id === 'adult_siamese' ? (
            // Siamese dark paws & tail tips
            <>
              <rect x="36" y="93" width="14" height="7" rx="3" fill="#451A03" />
              <rect x="70" y="93" width="14" height="7" rx="3" fill="#451A03" />
            </>
          ) : null}

          {/* SPECIAL WINGS (Legendary Celestial) */}
          {species.id === 'legend_celestial' && (
            <g fill="#C7D2FE" stroke="#4338CA" strokeWidth="2">
              <path d="M 38 65 Q 15 50 20 30 Q 32 40 38 55" />
              <path d="M 82 65 Q 105 50 100 30 Q 88 40 82 55" />
            </g>
          )}

          {/* FRONT PAWS */}
          {action === 'eat' ? (
            // Eating paws
            <>
              <circle cx="52" cy="82" r="5" fill="#FFFFFF" />
              <circle cx="68" cy="82" r="5" fill="#FFFFFF" />
            </>
          ) : species.id === 'adult_manekineko' ? (
            // Manekineko raised lucky paw!
            <>
              <circle cx="50" cy="84" r="6" fill="#FFFFFF" />
              <g className="animate-bounce">
                <rect x="72" y="44" width="10" height="20" rx="5" fill="#FFFFFF" />
                <circle cx="77" cy="42" r="6" fill="#FFFFFF" />
              </g>
            </>
          ) : (
            <>
              <rect x="48" y="82" width="10" height="15" rx="4" fill={species.furColor} />
              <rect x="62" y="82" width="10" height="15" rx="4" fill={species.furColor} />
            </>
          )}

          {/* HEAD */}
          <ellipse cx="60" cy="46" rx="26" ry="21" fill={species.furColor} />

          {/* EARS */}
          {/* Left Ear */}
          <polygon
            points="38,40 44,18 55,34"
            fill={species.id === 'adult_siamese' ? '#451A03' : species.furColor}
          />
          <polygon
            points="41,36 45,23 52,32"
            fill={species.patternColor || '#FBCFE8'}
            stroke="none"
          />
          {/* Right Ear */}
          <polygon
            points="82,40 76,18 65,34"
            fill={species.id === 'adult_siamese' ? '#451A03' : species.furColor}
          />
          <polygon
            points="79,36 75,23 68,32"
            fill={species.patternColor || '#FBCFE8'}
            stroke="none"
          />

          {/* HEAD PATTERNS */}
          {species.id === 'adult_hachiware' ? (
            // Hachiware 8-mask: dark forehead and white muzzle
            <>
              <polygon points="40,32 50,30 45,45" fill="#1E293B" stroke="none" />
              <polygon points="80,32 70,30 75,45" fill="#1E293B" stroke="none" />
              <polygon points="50,42 60,34 70,42 65,58 55,58" fill="#FFFFFF" stroke="none" />
            </>
          ) : species.id === 'child_playful' || species.id === 'adult_mike' ? (
            // Head patch
            <circle cx="48" cy="38" r="8" fill="#EA580C" stroke="none" />
          ) : species.id === 'child_glutton' || species.id === 'adult_chatora' ? (
            // Head forehead stripes
            <>
              <line x1="60" y1="30" x2="60" y2="38" stroke={species.patternColor} strokeWidth="2.5" />
              <line x1="53" y1="32" x2="55" y2="38" stroke={species.patternColor} strokeWidth="2" />
              <line x1="67" y1="32" x2="65" y2="38" stroke={species.patternColor} strokeWidth="2" />
            </>
          ) : species.id === 'adult_siamese' ? (
            // Center facial dark mask
            <ellipse cx="60" cy="48" rx="14" ry="12" fill="#451A03" stroke="none" />
          ) : null}

          {/* EYES */}
          {isSleeping ? (
            // Sleeping closed happy arcs ^ ^
            <>
              <path d="M 46 47 Q 52 42 56 47" fill="none" strokeWidth="3" />
              <path d="M 64 47 Q 68 42 74 47" fill="none" strokeWidth="3" />
            </>
          ) : isSick ? (
            // Sick dizzy eyes
            <>
              <path d="M 46 44 L 54 50 M 54 44 L 46 50" fill="none" strokeWidth="3" stroke="#DC2626" />
              <path d="M 66 44 L 74 50 M 74 44 L 66 50" fill="none" strokeWidth="3" stroke="#DC2626" />
            </>
          ) : action === 'happy' ? (
            // Overjoyed eyes > <
            <>
              <path d="M 46 44 L 54 48 L 46 52" fill="none" strokeWidth="3" />
              <path d="M 74 44 L 66 48 L 74 52" fill="none" strokeWidth="3" />
            </>
          ) : (
            // Normal / Big Cute Eyes
            <>
              {/* Left Eye */}
              <ellipse cx="50" cy="46" rx="5" ry="6" fill={species.eyeColor} />
              <circle cx="48.5" cy="44" r="2" fill="#FFFFFF" stroke="none" />
              <circle cx="51.5" cy="48" r="1" fill="#FFFFFF" stroke="none" />

              {/* Right Eye */}
              <ellipse cx="70" cy="46" rx="5" ry="6" fill={species.eyeColor} />
              <circle cx="68.5" cy="44" r="2" fill="#FFFFFF" stroke="none" />
              <circle cx="71.5" cy="48" r="1" fill="#FFFFFF" stroke="none" />
            </>
          )}

          {/* NOSE & MOUTH */}
          <polygon points="58,52 62,52 60,54" fill="#F43F5E" stroke="none" />
          {action === 'eat' ? (
            // Open mouth chewing
            <ellipse cx="60" cy="58" rx="5" ry="4" fill="#E11D48" />
          ) : (
            // Cute cat mouth :3
            <path d="M 55 55 Q 60 58 60 55 Q 60 58 65 55" fill="none" strokeWidth="2" />
          )}

          {/* CHEEKS */}
          <circle cx="43" cy="51" r="3" fill="#FDA4AF" stroke="none" opacity="0.8" />
          <circle cx="77" cy="51" r="3" fill="#FDA4AF" stroke="none" opacity="0.8" />

          {/* WHISKERS */}
          <line x1="32" y1="48" x2="42" y2="50" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="31" y1="54" x2="41" y2="54" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="88" y1="48" x2="78" y2="50" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="89" y1="54" x2="79" y2="54" stroke="#0F172A" strokeWidth="1.5" />

          {/* ACCESSORIES (Glasses, Crown, Wizard Hat, Manekineko Coin) */}
          {species.id === 'adult_kuro' && (
            // Intellectual Round Glasses
            <g stroke="#EAB308" strokeWidth="2.5" fill="none">
              <circle cx="50" cy="46" r="8" />
              <circle cx="70" cy="46" r="8" />
              <line x1="58" y1="46" x2="62" y2="46" />
            </g>
          )}

          {species.id === 'adult_shiro' && (
            // Princess Tiara & Ribbon
            <g fill="#F59E0B" stroke="#B45309" strokeWidth="2">
              <polygon points="52,24 55,16 60,20 65,16 68,24" />
              <circle cx="60" cy="20" r="2" fill="#3B82F6" stroke="none" />
            </g>
          )}

          {species.id === 'adult_manekineko' && (
            // Golden Oval Koban Coin & Red Collar Bell
            <>
              {/* Red Collar & Bell */}
              <path d="M 45 62 Q 60 67 75 62" stroke="#DC2626" strokeWidth="4" fill="none" />
              <circle cx="60" cy="65" r="4.5" fill="#EAB308" stroke="#854D0E" strokeWidth="1.5" />
              {/* Koban Coin */}
              <ellipse cx="50" cy="78" rx="8" ry="12" fill="#EAB308" stroke="#854D0E" strokeWidth="2" />
              <text x="50" y="82" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#713F12" stroke="none">
                千
              </text>
            </>
          )}

          {species.id === 'adult_sorcerer' && (
            // Wizard Hat with Star
            <g fill="#312E81" stroke="#4338CA" strokeWidth="2">
              <path d="M 40 28 L 60 4 L 80 28 Z" />
              <ellipse cx="60" cy="28" rx="24" ry="5" fill="#4338CA" />
              <polygon points="60,10 62,14 66,15 63,18 64,22 60,20 56,22 57,18 54,15 58,14" fill="#FACC15" stroke="none" />
            </g>
          )}

          {species.id === 'legend_royalty' && (
            // Royal Golden Crown & Majestic Lion Mane
            <g>
              {/* Mane */}
              <path
                d="M 32 38 Q 20 50 30 65 Q 22 75 35 85 Q 50 92 60 92 Q 70 92 85 85 Q 98 75 90 65 Q 100 50 88 38"
                fill="#D97706"
                opacity="0.9"
              />
              {/* Crown */}
              <polygon points="46,24 50,12 60,18 70,12 74,24" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
              <circle cx="60" cy="18" r="2.5" fill="#EF4444" stroke="none" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
