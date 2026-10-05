import React from 'react';
import { soundManager } from '../utils/audio';

interface ClockControlModalProps {
  currentAge: number;
  inGameHour: number;
  onAdvanceHours: (hours: number) => void;
  onAdvanceDays: (days: number) => void;
  onTriggerEggHatch: () => void;
  onTriggerFastEvolve: () => void;
  onClose: () => void;
}

export const ClockControlModal: React.FC<ClockControlModalProps> = ({
  currentAge,
  inGameHour,
  onAdvanceHours,
  onAdvanceDays,
  onTriggerEggHatch,
  onTriggerFastEvolve,
  onClose,
}) => {
  return (
    <div className="flex flex-col w-full max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏳</span>
          <div>
            <span className="font-pixel text-sm text-amber-400">じかんのすゝめ（タイムマシン）</span>
            <div className="text-[10px] text-slate-400">現在: {inGameHour}:00 ({currentAge}日目)</div>
          </div>
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

      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        毎日のお世話サイクルや、夜間の行動、進化の分岐変化をすぐに体験できる時間操作機能です。
      </p>

      <div className="space-y-2 mb-3">
        <div className="text-xs font-pixel text-slate-400">【 時計を進める 】</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundManager.playConfirm();
              onAdvanceHours(1);
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 text-left transition-all"
          >
            <div className="font-pixel text-xs text-amber-300">+1時間 進める</div>
            <div className="text-[10px] text-slate-400">お腹が少し空きます</div>
          </button>

          <button
            onClick={() => {
              soundManager.playConfirm();
              onAdvanceHours(6);
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 text-left transition-all"
          >
            <div className="font-pixel text-xs text-amber-300">+6時間 (昼/夜切り替え)</div>
            <div className="text-[10px] text-slate-400">夜間・睡眠タイムへ</div>
          </button>
        </div>

        <button
          onClick={() => {
            soundManager.playConfirm();
            onAdvanceDays(1);
          }}
          className="w-full p-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl border border-amber-500/40 text-left transition-all"
        >
          <div className="font-pixel text-xs text-amber-300">+1日 (24時間) スキップ</div>
          <div className="text-[10px] text-slate-400">年齢が1歳増え、デイリーミッションが更新されます</div>
        </button>
      </div>

      <div className="border-t border-slate-800 pt-3 space-y-2">
        <div className="text-xs font-pixel text-slate-400">【 クイック進化体験 】</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundManager.playHatch();
              onTriggerEggHatch();
            }}
            className="p-2 bg-indigo-900/40 hover:bg-indigo-900/60 rounded-xl border border-indigo-500/40 text-left transition-all"
          >
            <div className="font-pixel text-xs text-indigo-300">🐣 たまご即孵化</div>
            <div className="text-[10px] text-slate-400">こねこをすぐに誕生</div>
          </button>

          <button
            onClick={() => {
              soundManager.playEvolutionFanfare();
              onTriggerFastEvolve();
            }}
            className="p-2 bg-pink-900/40 hover:bg-pink-900/60 rounded-xl border border-pink-500/40 text-left transition-all"
          >
            <div className="font-pixel text-xs text-pink-300">✨ すぐに進化判定</div>
            <div className="text-[10px] text-slate-400">現在のステータスで進化</div>
          </button>
        </div>
      </div>
    </div>
  );
};
