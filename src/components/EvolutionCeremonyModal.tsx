import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CatEvolutionId, CAT_SPECIES } from '../types/cat';
import { CatSprite } from './CatSprite';
import { soundManager } from '../utils/audio';

interface EvolutionCeremonyModalProps {
  previousCatId: CatEvolutionId;
  newCatId: CatEvolutionId;
  reason: string;
  onClose: () => void;
}

export const EvolutionCeremonyModal: React.FC<EvolutionCeremonyModalProps> = ({
  previousCatId,
  newCatId,
  reason,
  onClose,
}) => {
  const newCat = CAT_SPECIES[newCatId] || CAT_SPECIES.baby_fluff;

  useEffect(() => {
    // Play fanfare
    soundManager.playEvolutionFanfare();

    // Fire fireworks confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } catch (e) {
      console.log('Confetti failed:', e);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-white text-center relative overflow-hidden animate-scaleIn">
        {/* Shimmer background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none" />

        <div className="font-pixel text-amber-400 text-sm tracking-widest mb-1 animate-pulse">
          ✨ CONGRATULATIONS! ✨
        </div>
        <h2 className="text-xl font-black font-pixel text-white mb-4">
          にゃんこが進化したよ！
        </h2>

        {/* Sprite Showcase with glowing halo */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-4 bg-slate-950/80 rounded-2xl border border-amber-500/40 p-2 shadow-inner">
          <div className="absolute inset-0 rounded-2xl bg-amber-400/10 animate-ping" />
          <CatSprite catId={newCatId} action="happy" className="scale-110" />
        </div>

        {/* Species Info */}
        <div className="text-xs font-pixel text-amber-300 mb-1">{newCat.title}</div>
        <h3 className="text-lg font-bold text-white mb-2">{newCat.name}</h3>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 leading-relaxed mb-4 text-left">
          <p className="mb-2 font-medium text-amber-100">{reason}</p>
          <p className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2">
            「{newCat.description}」
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playConfirm();
            onClose();
          }}
          className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-pixel text-sm font-black rounded-xl shadow-lg transition-transform"
        >
          図鑑に登録して戻る
        </button>
      </div>
    </div>
  );
};
