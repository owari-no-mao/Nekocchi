import React, { useState, useEffect, useCallback } from 'react';
import { PetGameState, ShellColorId, LcdBacklightId } from '../types/game';
import { CatSprite } from './CatSprite';
import { soundManager } from '../utils/audio';

interface TamagotchiShellProps {
  state: PetGameState;
  onFeedMeal: () => void;
  onFeedSnack: () => void;
  onCleanToilet: () => void;
  onPetOrBrush: () => void;
  onToggleLight: () => void;
  onPlayGame: () => void;
  onHeal: () => void;
  onDirectEggTap: () => void;
  onOpenEvolutionTree: () => void;
  actionFeedback: string | null;
}

// 8 Authentic Tamagotchi Bezel Menu Icons
export const TAMAGOTCHI_ACTIONS = [
  { id: 'meal', label: 'ごはん', icon: '🍙', desc: 'カリカリをもぐもぐ' },
  { id: 'snack', label: 'おやつ', icon: '🐟', desc: 'ちゅ〜るをペロペロ' },
  { id: 'clean', label: 'そうじ', icon: '🧹', desc: 'トイレをピカピカに' },
  { id: 'pet', label: 'なでる', icon: '✨', desc: 'ゴロゴロなでなで' },
  { id: 'light', label: 'でんき', icon: '💡', desc: '消灯しておやすみ' },
  { id: 'play', label: 'あそぶ', icon: '🎾', desc: 'ミニゲームで運動' },
  { id: 'heal', label: 'お薬', icon: '💊', desc: '病気を治して元気に' },
  { id: 'tree', label: 'ツリー', icon: '🌿', desc: '進化系統ツリー' },
] as const;

export const SHELL_THEMES: Record<
  ShellColorId,
  {
    outerGradient: string;
    borderAccent: string;
    buttonColor: string;
    buttonBorder: string;
  }
> = {
  classic_pink: {
    outerGradient: 'from-pink-300 via-rose-300 to-pink-400',
    borderAccent: 'border-pink-400',
    buttonColor: 'bg-yellow-300 active:bg-yellow-400 text-yellow-950',
    buttonBorder: 'border-yellow-500 shadow-[0_4px_0_#ca8a04]',
  },
  mint_green: {
    outerGradient: 'from-emerald-200 via-teal-300 to-emerald-400',
    borderAccent: 'border-teal-400',
    buttonColor: 'bg-emerald-300 active:bg-emerald-400 text-emerald-950',
    buttonBorder: 'border-emerald-500 shadow-[0_4px_0_#059669]',
  },
  creamy_butter: {
    outerGradient: 'from-amber-100 via-yellow-200 to-amber-300',
    borderAccent: 'border-amber-300',
    buttonColor: 'bg-orange-300 active:bg-orange-400 text-orange-950',
    buttonBorder: 'border-orange-500 shadow-[0_4px_0_#ea580c]',
  },
  cyber_lilac: {
    outerGradient: 'from-purple-300 via-indigo-300 to-purple-400',
    borderAccent: 'border-indigo-400',
    buttonColor: 'bg-pink-300 active:bg-pink-400 text-pink-950',
    buttonBorder: 'border-pink-500 shadow-[0_4px_0_#db2777]',
  },
  retro_yellow: {
    outerGradient: 'from-yellow-200 via-amber-300 to-yellow-400',
    borderAccent: 'border-amber-400',
    buttonColor: 'bg-cyan-300 active:bg-cyan-400 text-cyan-950',
    buttonBorder: 'border-cyan-500 shadow-[0_4px_0_#0891b2]',
  },
};

export const BACKLIGHT_THEMES: Record<
  LcdBacklightId,
  {
    screenBg: string;
    screenText: string;
    borderGlow: string;
  }
> = {
  matrix_green: {
    screenBg: 'bg-[#98A886]',
    screenText: 'text-[#1E2616]',
    borderGlow: 'shadow-[inset_0_0_12px_rgba(0,0,0,0.18)]',
  },
  warm_amber: {
    screenBg: 'bg-[#F2CCA0]',
    screenText: 'text-[#3E2310]',
    borderGlow: 'shadow-[inset_0_0_12px_rgba(0,0,0,0.2)]',
  },
  cyber_blue: {
    screenBg: 'bg-[#A2C9D8]',
    screenText: 'text-[#102936]',
    borderGlow: 'shadow-[inset_0_0_12px_rgba(0,0,0,0.2)]',
  },
  classic_grey: {
    screenBg: 'bg-[#C2C7BA]',
    screenText: 'text-[#20241E]',
    borderGlow: 'shadow-[inset_0_0_12px_rgba(0,0,0,0.18)]',
  },
};

export const TamagotchiShell: React.FC<TamagotchiShellProps> = ({
  state,
  onFeedMeal,
  onFeedSnack,
  onCleanToilet,
  onPetOrBrush,
  onToggleLight,
  onPlayGame,
  onHeal,
  onDirectEggTap,
  onOpenEvolutionTree,
  actionFeedback,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [catDirection, setCatDirection] = useState<'left' | 'right'>('right');
  const [catAction, setCatAction] = useState<
    'idle' | 'walk' | 'eat' | 'sleep' | 'happy' | 'sad' | 'sick' | 'naughty' | 'brush' | 'poop' | 'evolve'
  >('idle');

  const shellTheme = SHELL_THEMES[state.activeShell] || SHELL_THEMES.classic_pink;
  const backlightTheme = BACKLIGHT_THEMES[state.activeBacklight] || BACKLIGHT_THEMES.matrix_green;

  // React to status changes
  useEffect(() => {
    if (state.isSleeping) {
      setCatAction('sleep');
    } else if (state.isSick) {
      setCatAction('sick');
    } else if (state.isNaughty) {
      setCatAction('naughty');
    } else {
      setCatAction('idle');
    }
  }, [state.isSleeping, state.isSick, state.isNaughty]);

  // Occasional random walking inside screen
  useEffect(() => {
    if (!state.hatched || state.isSleeping || state.isSick) return;
    const wanderTimer = setInterval(() => {
      if (Math.random() > 0.6) {
        setCatAction('walk');
        setCatDirection((prev) => (prev === 'left' ? 'right' : 'left'));
        setTimeout(() => setCatAction('idle'), 2500);
      }
    }, 7000);
    return () => clearInterval(wanderTimer);
  }, [state.hatched, state.isSleeping, state.isSick]);

  // Execute an action directly by index (Instant! Zero-nonsense!)
  const executeActionByIndex = useCallback((idx: number) => {
    const action = TAMAGOTCHI_ACTIONS[idx];
    if (!action) return;

    switch (action.id) {
      case 'meal':
        soundManager.playEat();
        setCatAction('eat');
        setTimeout(() => setCatAction('idle'), 1600);
        onFeedMeal();
        break;
      case 'snack':
        soundManager.playEat();
        soundManager.playPurr();
        setCatAction('happy');
        setTimeout(() => setCatAction('idle'), 1600);
        onFeedSnack();
        break;
      case 'clean':
        soundManager.playClean();
        setCatAction('happy');
        setTimeout(() => setCatAction('idle'), 1600);
        onCleanToilet();
        break;
      case 'pet':
        soundManager.playPurr();
        soundManager.playMeow('happy');
        setCatAction('happy');
        setTimeout(() => setCatAction('idle'), 1600);
        onPetOrBrush();
        break;
      case 'light':
        soundManager.playSelect();
        onToggleLight();
        break;
      case 'play':
        soundManager.playConfirm();
        onPlayGame();
        break;
      case 'heal':
        soundManager.playConfirm();
        onHeal();
        break;
      case 'tree':
        soundManager.playConfirm();
        onOpenEvolutionTree();
        break;
    }
  }, [onFeedMeal, onFeedSnack, onCleanToilet, onPetOrBrush, onToggleLight, onPlayGame, onHeal, onOpenEvolutionTree]);

  // BUTTON [A]: Cycle through menu items with retro blip
  const handleButtonA = useCallback(() => {
    soundManager.playSelect();
    setSelectedIdx((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % TAMAGOTCHI_ACTIONS.length;
    });
  }, []);

  // BUTTON [B]: Execute selected action directly, or pet cat if idle
  const handleButtonB = useCallback(() => {
    if (!state.hatched) {
      soundManager.playEggTap();
      onDirectEggTap();
      return;
    }

    if (selectedIdx !== null) {
      executeActionByIndex(selectedIdx);
    } else {
      // Idle: direct pet & purr
      soundManager.playPurr();
      soundManager.playMeow('happy');
      setCatAction('happy');
      setTimeout(() => setCatAction('idle'), 1600);
      onPetOrBrush();
    }
  }, [state.hatched, selectedIdx, executeActionByIndex, onDirectEggTap, onPetOrBrush]);

  // BUTTON [C]: Deselect / Cancel back to idle
  const handleButtonC = useCallback(() => {
    soundManager.playCancel();
    setSelectedIdx((prev) => (prev === null ? 0 : null));
  }, []);

  // Physical Keyboard Support: A, B, C or Arrows & Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleButtonA();
      } else if (e.key === 'b' || e.key === 'B' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleButtonB();
      } else if (e.key === 'c' || e.key === 'C' || e.key === 'Escape') {
        e.preventDefault();
        handleButtonC();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButtonA, handleButtonB, handleButtonC]);

  const isNight = state.inGameHour >= 20 || state.inGameHour < 6 || state.lightsOff;
  const currentAction = selectedIdx !== null ? TAMAGOTCHI_ACTIONS[selectedIdx] : null;

  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-2 select-none">
      {/* Keychain Loop Ring */}
      <div className="flex flex-col items-center -mb-4 z-0">
        <div className="w-8 h-8 rounded-full border-4 border-slate-400 bg-slate-300 shadow-md" />
        <div className="w-4 h-4 rounded-full border-2 border-slate-400 bg-slate-200 -mt-1 shadow-sm" />
      </div>

      {/* Main Egg Shell Device Body */}
      <div
        className={`relative z-10 w-[340px] sm:w-[370px] h-[520px] sm:h-[540px] rounded-[180px/250px] bg-gradient-to-b ${shellTheme.outerGradient} p-5 sm:p-6 shadow-2xl border-4 ${shellTheme.borderAccent} flex flex-col items-center justify-between transition-colors duration-500`}
        style={{
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.35), inset 0 -8px 16px rgba(0,0,0,0.15)',
        }}
      >
        {/* Curved Plastic Gloss Sheen */}
        <div className="absolute top-4 left-12 w-28 h-10 rounded-full bg-white/40 blur-[1px] pointer-events-none -rotate-12" />

        {/* Brand Wordmark (Tamagotchi Style) */}
        <div className="text-center pt-0.5">
          <div className="font-pixel text-sm tracking-widest text-slate-800/90 font-black flex items-center justify-center gap-1.5">
            <span>★</span> <span>ね こ っ ち</span> <span>★</span>
          </div>
          <div className="text-[9px] font-pixel text-slate-700/60 tracking-wider">
            AUTHENTIC 3-BUTTON OPERATED VIRTUAL PET
          </div>
        </div>

        {/* LCD Screen Housing Bezel Frame */}
        <div className="w-full max-w-[290px] bg-slate-800/95 rounded-[36px] p-2.5 shadow-inner border-2 border-slate-700/80 flex flex-col items-center">
          
          {/* Top 4 Authentic Menu Icons */}
          <div className="grid grid-cols-4 w-full gap-1 mb-1 px-1">
            {TAMAGOTCHI_ACTIONS.slice(0, 4).map((item, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playSelect();
                    setSelectedIdx(idx);
                    executeActionByIndex(idx);
                  }}
                  className={`flex flex-col items-center justify-center py-1 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold scale-105 shadow-md ring-1 ring-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title={`${item.label} (クリックで即実行)`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[9px] font-pixel leading-none mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* LCD Screen Display */}
          <div
            className={`relative w-full h-[200px] ${backlightTheme.screenBg} ${backlightTheme.screenText} ${backlightTheme.borderGlow} rounded-2xl overflow-hidden p-2 flex flex-col justify-between border-2 border-slate-900/30 lcd-screen-matrix`}
          >
            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 lcd-scanline pointer-events-none opacity-60 z-10" />

            {/* Screen Top Status Bar (Clock, Age, Vitals Glance) */}
            <div className="flex items-center justify-between text-[10px] font-pixel font-bold z-20 opacity-85 border-b border-black/10 pb-0.5">
              <span>{state.inGameHour}:00 {isNight ? '🌙' : '☀️'}</span>
              <span>{state.ageDays}日目 · {state.weight.toFixed(1)}kg</span>
              <span>{state.coins}🪙</span>
            </div>

            {/* Room Background & Cat Living Scene */}
            <div className="relative flex-1 flex items-center justify-center w-full z-10 overflow-hidden">
              {/* Window & Sky Backdrop */}
              <div className="absolute top-1 right-2 w-10 h-10 border border-black/20 rounded bg-black/5 flex items-center justify-center text-xs">
                {isNight ? '⭐' : '☁️'}
              </div>

              {/* Cat Food Bowl in corner */}
              <div className="absolute bottom-2 left-2 text-xs opacity-75">
                {state.hunger > 60 ? '🥣' : '🥣 (空)'}
              </div>

              {/* Poop sprites if dirty */}
              {state.poopCount > 0 && (
                <div className="absolute bottom-2 right-4 flex gap-1 animate-bounce text-sm">
                  {Array.from({ length: state.poopCount }).map((_, i) => (
                    <span key={i} title="うんち！[そうじ]で掃除">💩</span>
                  ))}
                </div>
              )}

              {/* Action Feedback Bubble (Instant on-screen feedback!) */}
              {actionFeedback && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 font-pixel text-[10px] px-2.5 py-1 rounded-full shadow-md z-30 animate-scaleIn border border-amber-400/40 whitespace-nowrap">
                  {actionFeedback}
                </div>
              )}

              {/* Central Pet or Egg Sprite */}
              <div className="relative z-20">
                <CatSprite
                  catId={state.catId}
                  action={catAction}
                  isSleeping={state.isSleeping}
                  isSick={state.isSick}
                  isNaughty={state.isNaughty}
                  eggTaps={state.eggTaps}
                  direction={catDirection}
                  onClick={() => {
                    if (!state.hatched) {
                      soundManager.playEggTap();
                      onDirectEggTap();
                    } else {
                      soundManager.playPurr();
                      onPetOrBrush();
                    }
                  }}
                />
              </div>

              {/* Sleep Darkness Overlay if Lights are off */}
              {state.lightsOff && (
                <div className="absolute inset-0 bg-black/60 z-25 flex items-center justify-center">
                  <span className="font-pixel text-xs text-white/80 animate-pulse">でんき OFF (おやすみ中...)</span>
                </div>
              )}
            </div>

            {/* Screen Bottom Prompt / Status text */}
            <div className="text-[10px] font-pixel text-center z-20 opacity-85 truncate border-t border-black/10 pt-0.5">
              {!state.hatched
                ? '【B】ボタンでたまごを温めてね！'
                : state.isSick
                ? '⚠️ 具合が悪そう！[おくすり]を選んで[B]！'
                : state.poopCount > 0
                ? '🧹 うんちがあります！[そうじ]を選んで[B]！'
                : currentAction
                ? `▶【${currentAction.label}】[B]ボタンで即実行！`
                : `満腹:${state.hunger}% · ごきげん:${state.happiness}% · [A]選択 [B]決定`}
            </div>
          </div>

          {/* Bottom 4 Authentic Menu Icons */}
          <div className="grid grid-cols-4 w-full gap-1 mt-1 px-1">
            {TAMAGOTCHI_ACTIONS.slice(4, 8).map((item, idx) => {
              const actualIdx = idx + 4;
              const isSelected = selectedIdx === actualIdx;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playSelect();
                    setSelectedIdx(actualIdx);
                    executeActionByIndex(actualIdx);
                  }}
                  className={`flex flex-col items-center justify-center py-1 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold scale-105 shadow-md ring-1 ring-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title={`${item.label} (クリックで即実行)`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[9px] font-pixel leading-none mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Physical Authentic Tamagotchi Hardware Buttons (PRIMARY CONTROLLER) */}
        <div className="flex items-center justify-center gap-7 pt-2 pb-1 w-full">
          {/* Button A: Select / Cycle */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleButtonA}
              className={`w-12 h-12 rounded-full ${shellTheme.buttonColor} ${shellTheme.buttonBorder} border-2 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-retro text-sm font-black shadow-md cursor-pointer`}
              title="Aボタン：メニューを選ぶ（キーボード: A または →）"
            >
              A
            </button>
            <span className="text-[10px] font-pixel text-slate-900 font-bold mt-1">えらぶ</span>
          </div>

          {/* Button B: Execute / Action (Raised Center) */}
          <div className="flex flex-col items-center -translate-y-2">
            <button
              onClick={handleButtonB}
              className={`w-13 h-13 rounded-full ${shellTheme.buttonColor} ${shellTheme.buttonBorder} border-2 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-retro text-base font-black shadow-xl cursor-pointer ring-2 ring-white/40`}
              title="Bボタン：実行 / なでる（キーボード: B または Enter/Space）"
            >
              B
            </button>
            <span className="text-[10px] font-pixel text-slate-900 font-black mt-1">けってい</span>
          </div>

          {/* Button C: Cancel / Reset selection */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleButtonC}
              className={`w-12 h-12 rounded-full ${shellTheme.buttonColor} ${shellTheme.buttonBorder} border-2 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-retro text-sm font-black shadow-md cursor-pointer`}
              title="Cボタン：解除 / もどる（キーボード: C または Esc）"
            >
              C
            </button>
            <span className="text-[10px] font-pixel text-slate-900 font-bold mt-1">もどる</span>
          </div>
        </div>

        {/* Keyboard Shortcut Indicator */}
        <div className="text-[9px] font-pixel text-slate-700/80 -mt-1">
          キーボード [A] [B] [C] でも快適に操作できます
        </div>
      </div>
    </div>
  );
};
