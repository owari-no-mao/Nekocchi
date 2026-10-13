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
    <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-6 py-2.5 gap-2 sm:gap-4 overflow-hidden">
        
        {/* Zone 1: Single text element wordmark (never wraps or shrinks) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            className="flex items-center gap-2 text-slate-900 font-pixel text-base sm:text-lg font-black tracking-tight whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
          >
            <span className="text-xl leading-none">🐱</span>
            <span className="whitespace-nowrap">ねこっち</span>
          </a>

          {/* Clean unboxed metadata with separators (Desktop only, never wraps) */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-pixel whitespace-nowrap shrink-0">
            <span>{coins} 🪙</span>
            <span aria-hidden="true">·</span>
            <span>{streakDays}日連続お世話</span>
          </div>
        </div>

        {/* Zone 2: Navigation buttons (horizontal scrolling on narrow screens, never wrapping vertically) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 px-1 shrink">
          <button
            onClick={() => {
              soundManager.playConfirm();
              onOpenModal('evolution_tree');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-pixel font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 transition-all whitespace-nowrap shrink-0 shadow-xs active:scale-95"
          >
            <span>🌿</span>
            <span>進化ツリー</span>
          </button>

          <button
            onClick={() => {
              soundManager.playSelect();
              onOpenModal('daily_care');
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-pixel text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <span>📖</span>
            <span>思い出手帳</span>
          </button>

          <button
            onClick={() => {
              soundManager.playSelect();
              onOpenModal('zukan');
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-pixel text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            図鑑
          </button>

          <button
            onClick={() => {
              soundManager.playSelect();
              onOpenModal('menu_play');
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-pixel text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 hidden sm:inline-flex"
          >
            ミニゲーム
          </button>

          <button
            onClick={() => {
              soundManager.playSelect();
              onOpenModal('shop');
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-pixel text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 hidden md:inline-flex"
          >
            ショップ
          </button>

          <button
            onClick={() => {
              soundManager.playSelect();
              onOpenModal('time_machine');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-pixel font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 border border-amber-200/80 transition-colors whitespace-nowrap shrink-0"
            title="時計操作・クイック進化"
          >
            <span>⏳</span>
            <span>時間操作</span>
          </button>
        </nav>

        {/* Zone 3: Primary utility actions (never shrinks) */}
        <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <button
            onClick={onToggleSound}
            className="w-8 h-8 flex items-center justify-center text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
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
            className="px-2.5 py-1.5 text-xs font-pixel text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            リセット
          </button>
        </div>
      </div>
    </header>
  );
};
