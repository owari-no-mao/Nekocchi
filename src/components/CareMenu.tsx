import React from 'react';
import { soundManager } from '../utils/audio';

interface CareMenuProps {
  type: 'food' | 'clean' | 'discipline' | 'medicine';
  coins: number;
  onFeedMeal: (foodType: string, hungerVal: number, weightVal: number) => void;
  onFeedSnack: (snackType: string, happinessVal: number, hungerVal: number, weightVal: number) => void;
  onCleanToilet: () => void;
  onBath: () => void;
  onScold: () => void;
  onPraise: () => void;
  onHeal: () => void;
  onClose: () => void;
}

export const CareMenu: React.FC<CareMenuProps> = ({
  type,
  onFeedMeal,
  onFeedSnack,
  onCleanToilet,
  onBath,
  onScold,
  onPraise,
  onHeal,
  onClose,
}) => {
  return (
    <div className="flex flex-col w-full max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <span className="font-pixel text-sm text-amber-400">
          {type === 'food' && '🍙 ごはん & おやつ'}
          {type === 'clean' && '🧹 トイレ & お風呂'}
          {type === 'discipline' && '📖 しつけ & コミュニケーション'}
          {type === 'medicine' && '💉 ちりょう & けんこう'}
        </span>
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

      {/* Food Menu */}
      {type === 'food' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-slate-400 font-pixel">【 主食 (ごはん) 】満腹度UP</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playEat();
                onFeedMeal('カリカリフード', 30, 0.1);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-750 active:scale-95 rounded-xl border border-slate-700 text-left transition-all"
            >
              <span className="text-2xl">🥣</span>
              <div>
                <div className="font-pixel text-xs text-amber-300">カリカリ</div>
                <div className="text-[10px] text-slate-400">満腹+30 体重+0.1kg</div>
              </div>
            </button>

            <button
              onClick={() => {
                soundManager.playEat();
                onFeedMeal('サーモン缶詰', 50, 0.2);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-750 active:scale-95 rounded-xl border border-slate-700 text-left transition-all"
            >
              <span className="text-2xl">🥫</span>
              <div>
                <div className="font-pixel text-xs text-amber-300">サーモン缶</div>
                <div className="text-[10px] text-slate-400">満腹+50 体重+0.2kg</div>
              </div>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-pixel mt-1">【 おやつ 】ごきげん＆なかよし度UP (あげすぎ注意)</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playEat();
                soundManager.playMeow('happy');
                onFeedSnack('ちゅ〜る', 35, 10, 0.15);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-750 active:scale-95 rounded-xl border border-pink-500/30 text-left transition-all"
            >
              <span className="text-2xl">🐟</span>
              <div>
                <div className="font-pixel text-xs text-pink-300">ちゅ〜る</div>
                <div className="text-[10px] text-slate-400">ごきげん+35 満腹+10</div>
              </div>
            </button>

            <button
              onClick={() => {
                soundManager.playEat();
                soundManager.playPurr();
                onFeedSnack('またたびクッキー', 40, 5, 0.05);
              }}
              className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-750 active:scale-95 rounded-xl border border-emerald-500/30 text-left transition-all"
            >
              <span className="text-2xl">🍪</span>
              <div>
                <div className="font-pixel text-xs text-emerald-300">またたびクッキー</div>
                <div className="text-[10px] text-slate-400">ごきげん+40 ゴロゴロ</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Clean Menu */}
      {type === 'clean' && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-slate-300 mb-1">
            トイレ掃除を怠ると部屋が汚れ、病気の原因になります。
          </p>

          <button
            onClick={() => {
              soundManager.playClean();
              onCleanToilet();
            }}
            className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded-xl border border-cyan-500/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧹</span>
              <div>
                <div className="font-pixel text-xs text-cyan-300">トイレそうじ</div>
                <div className="text-[10px] text-slate-400">うんちを片付けてすっきり！</div>
              </div>
            </div>
            <span className="text-xs font-pixel text-cyan-400">実行</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClean();
              soundManager.playMeow('happy');
              onBath();
            }}
            className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded-xl border border-sky-500/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛁</span>
              <div>
                <div className="font-pixel text-xs text-sky-300">シャンプー & お風呂</div>
                <div className="text-[10px] text-slate-400">清潔度を100%までピカピカに回復</div>
              </div>
            </div>
            <span className="text-xs font-pixel text-sky-400">実行</span>
          </button>
        </div>
      )}

      {/* Discipline Menu */}
      {type === 'discipline' && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-slate-300 mb-1">
            いたずらした時は「しかる」、良い行いには「ほめる」でしつけ度を育てます。
          </p>

          <button
            onClick={() => {
              soundManager.playConfirm();
              onPraise();
            }}
            className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded-xl border border-emerald-500/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👏</span>
              <div>
                <div className="font-pixel text-xs text-emerald-300">ほめる・よしよし</div>
                <div className="text-[10px] text-slate-400">信頼関係としつけ度UP</div>
              </div>
            </div>
            <span className="text-xs font-pixel text-emerald-400">実行</span>
          </button>

          <button
            onClick={() => {
              soundManager.playCancel();
              onScold();
            }}
            className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded-xl border border-red-500/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-pixel text-xs text-red-300">しかる (いたずら指導)</div>
                <div className="text-[10px] text-slate-400">いたずら中に叱ると効果大</div>
              </div>
            </div>
            <span className="text-xs font-pixel text-red-400">実行</span>
          </button>
        </div>
      )}

      {/* Medicine Menu */}
      {type === 'medicine' && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs text-slate-300 mb-1">
            うんち放置や不規則な生活で体調を崩した時は、お薬で治してあげましょう。
          </p>

          <button
            onClick={() => {
              soundManager.playConfirm();
              onHeal();
            }}
            className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded-xl border border-purple-500/30 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💊</span>
              <div>
                <div className="font-pixel text-xs text-purple-300">ねこ用おくすり</div>
                <div className="text-[10px] text-slate-400">病気や胃もたれを治療します</div>
              </div>
            </div>
            <span className="text-xs font-pixel text-purple-400">投与する</span>
          </button>
        </div>
      )}
    </div>
  );
};
