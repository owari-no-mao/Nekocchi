import React from 'react';
import { ActiveModal } from '../types/game';
import { soundManager } from '../utils/audio';

interface TopNavProps {
  coins: number;
  streakDays: number;
  soundEnabled: boolean;
  onOpenModal: (modal: ActiveModal) => void;
  onToggleSound: () => void;
  onResetGame: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  coins,
  streakDays,
  soundEnabled,
  onOpenModal,
  onToggleSound,
  onResetGame,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-lg font-black tracking-tight text-slate-900 font-pixel flex items-center gap-1.5">
          <span className="text-xl">🐱</span> ねこっち
        </a>

        {/* Clean unboxed metadata with separators (Anti-slop compliant) */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-pixel">
          <span>{coins} コイン</span>
          <span aria-hidden="true">·</span>
          <span>{streakDays}日連続お世話中</span>
        </div>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600">
        <button
          onClick={() => {
            soundManager.playSelect();
            onOpenModal('daily_care');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          お世話手帳
        </button>
        <button
          onClick={() => {
            soundManager.playSelect();
            onOpenModal('zukan');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          進化図鑑
        </button>
        <button
          onClick={() => {
            soundManager.playSelect();
            onOpenModal('menu_play');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          ミニゲーム
        </button>
        <button
          onClick={() => {
            soundManager.playSelect();
            onOpenModal('shop');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap hidden sm:inline"
        >
          ショップ
        </button>
        <button
          onClick={() => {
            soundManager.playSelect();
            onOpenModal('time_machine');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap text-amber-600"
          title="時計操作・クイック進化"
        >
          ⏳ 時間操作
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          className="p-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title={soundEnabled ? 'サウンドON' : 'サウンドOFF'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        <button
          onClick={() => {
            if (confirm('最初から（たまご）やり直しますか？')) {
              onResetGame();
            }
          }}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
        >
          リセット
        </button>
      </div>
    </header>
  );
};
