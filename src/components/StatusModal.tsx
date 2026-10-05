import React from 'react';
import { PetGameState } from '../types/game';
import { CAT_SPECIES } from '../types/cat';
import { soundManager } from '../utils/audio';

interface StatusModalProps {
  state: PetGameState;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ state, onClose, onRename }) => {
  const currentSpecies = CAT_SPECIES[state.catId];
  const [editingName, setEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(state.catName);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onRename(tempName.trim());
      setEditingName(false);
      soundManager.playConfirm();
    }
  };

  const getMeterColor = (val: number) => {
    if (val >= 70) return 'bg-emerald-500';
    if (val >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col w-full max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="font-pixel text-sm text-amber-400">ステータス手帳</span>
        </div>
        <button
          onClick={() => {
            soundManager.playCancel();
            onClose();
          }}
          className="text-xs text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded transition-colors"
        >
          とじる
        </button>
      </div>

      {/* Cat Profile Summary */}
      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 mb-3">
        <div className="flex items-center justify-between mb-1">
          {editingName ? (
            <form onSubmit={handleSaveName} className="flex gap-1 items-center">
              <input
                type="text"
                value={tempName}
                maxLength={10}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-slate-950 px-2 py-0.5 text-xs rounded border border-amber-500/50 text-white w-28 focus:outline-none"
                autoFocus
              />
              <button type="submit" className="text-[10px] bg-amber-500 text-slate-950 font-pixel px-1.5 py-0.5 rounded">
                決定
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-amber-300">{state.catName}</span>
              <button
                onClick={() => setEditingName(true)}
                className="text-[10px] text-slate-400 hover:text-slate-200"
                title="なまえを変更"
              >
                ✏️
              </button>
            </div>
          )}
          <span className="text-xs font-pixel text-slate-300">
            {currentSpecies.name}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-700/60 text-center">
          <div>
            <div className="text-[10px] text-slate-400">ねんれい</div>
            <div className="font-pixel text-xs text-slate-200">{state.ageDays}日目</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">たいじゅう</div>
            <div className="font-pixel text-xs text-slate-200">{state.weight.toFixed(1)}kg</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">せだい</div>
            <div className="font-pixel text-xs text-slate-200">{state.generation}代目</div>
          </div>
        </div>
      </div>

      {/* Vitals Progress Bars */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="text-xs font-pixel text-slate-400">【 バイタルメーター 】</div>

        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-300">🍙 まんぷく度</span>
            <span className="font-pixel text-slate-200">{state.hunger}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${getMeterColor(state.hunger)}`} style={{ width: `${state.hunger}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-300">♪ ごきげん</span>
            <span className="font-pixel text-slate-200">{state.happiness}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${getMeterColor(state.happiness)}`} style={{ width: `${state.happiness}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-300">✨ せいけつ度</span>
            <span className="font-pixel text-slate-200">{state.cleanliness}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${getMeterColor(state.cleanliness)}`} style={{ width: `${state.cleanliness}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-300">📖 しつけ度</span>
            <span className="font-pixel text-slate-200">{state.discipline}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full bg-indigo-500 transition-all`} style={{ width: `${state.discipline}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-300">💡 ちせい (知性)</span>
            <span className="font-pixel text-slate-200">{state.intelligence}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full bg-cyan-500 transition-all`} style={{ width: `${state.intelligence}%` }} />
          </div>
        </div>
      </div>

      {/* Lifetime Care Stats */}
      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
        <div className="text-amber-400 font-pixel text-xs mb-1">【 累計お世話データ 】</div>
        <div className="flex justify-between">
          <span>ごはん / おやつ</span>
          <span className="font-pixel">{state.lifetimeMealsGiven}回 / {state.lifetimeSnacksGiven}回</span>
        </div>
        <div className="flex justify-between">
          <span>ブラッシング回数</span>
          <span className="font-pixel">{state.lifetimeBrushCount}回</span>
        </div>
        <div className="flex justify-between">
          <span>ミニゲーム勝利数</span>
          <span className="font-pixel">{state.lifetimeMiniGamesWon}回 (得点: {state.lifetimeMiniGamesScore})</span>
        </div>
        <div className="flex justify-between">
          <span>お世話ミス (放置・空腹)</span>
          <span className={`font-pixel ${state.careMistakes > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {state.careMistakes}回
          </span>
        </div>
      </div>

      {/* Evolution Hint */}
      <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-200">
        <span className="font-bold">💡 進化のヒント: </span>
        {currentSpecies.evolutionHint}
      </div>
    </div>
  );
};
