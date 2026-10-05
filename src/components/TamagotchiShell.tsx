import React, { useState, useEffect } from 'react';
import { PetGameState, ShellColorId, LcdBacklightId } from '../types/game';
import { CatSprite } from './CatSprite';
import { soundManager } from '../utils/audio';

interface TamagotchiShellProps {
  state: PetGameState;
  onSelectAction: (index: number) => void;
  onExecuteAction: () => void;
  onCancelAction: () => void;
  onDirectPetTouch: () => void;
  onDirectEggTap: () => void;
  children?: React.ReactNode;
}

// 8 Classic Tamagotchi Menu Icons
export const MENU_ICONS = [
  { id: 'food', label: 'ごはん', icon: '🍙' },
  { id: 'light', label: 'でんき', icon: '💡' },
  { id: 'play', label: 'あそび', icon: '🎾' },
  { id: 'medicine', label: 'お薬', icon: '💉' },
  { id: 'clean', label: 'トイレ', icon: '🧹' },
  { id: 'brush', label: 'ブラッシング', icon: '✨' },
  { id: 'discipline', label: 'しつけ', icon: '📖' },
  { id: 'status', label: '手帳', icon: '📊' },
];

export const SHELL_THEMES: Record<
  ShellColorId,
  {
    outerGradient: string;
    borderAccent: string;
    highlight: string;
    buttonColor: string;
    buttonBorder: string;
    shadowColor: string;
  }
> = {
  classic_pink: {
    outerGradient: 'from-pink-300 via-rose-300 to-pink-400',
    borderAccent: 'border-pink-400',
    highlight: 'bg-white/40',
    buttonColor: 'bg-yellow-300 active:bg-yellow-400 text-yellow-950',
    buttonBorder: 'border-yellow-500 shadow-[0_4px_0_#ca8a04]',
    shadowColor: 'shadow-pink-900/30',
  },
  mint_green: {
    outerGradient: 'from-emerald-200 via-teal-300 to-emerald-400',
    borderAccent: 'border-teal-400',
    highlight: 'bg-white/40',
    buttonColor: 'bg-emerald-300 active:bg-emerald-400 text-emerald-950',
    buttonBorder: 'border-emerald-500 shadow-[0_4px_0_#059669]',
    shadowColor: 'shadow-teal-900/30',
  },
  creamy_butter: {
    outerGradient: 'from-amber-100 via-yellow-200 to-amber-300',
    borderAccent: 'border-amber-300',
    highlight: 'bg-white/50',
    buttonColor: 'bg-orange-300 active:bg-orange-400 text-orange-950',
    buttonBorder: 'border-orange-500 shadow-[0_4px_0_#ea580c]',
    shadowColor: 'shadow-amber-900/30',
  },
  cyber_lilac: {
    outerGradient: 'from-purple-300 via-indigo-300 to-purple-400',
    borderAccent: 'border-indigo-400',
    highlight: 'bg-white/40',
    buttonColor: 'bg-pink-300 active:bg-pink-400 text-pink-950',
    buttonBorder: 'border-pink-500 shadow-[0_4px_0_#db2777]',
    shadowColor: 'shadow-purple-900/30',
  },
  retro_yellow: {
    outerGradient: 'from-yellow-200 via-amber-300 to-yellow-400',
    borderAccent: 'border-amber-400',
    highlight: 'bg-white/40',
    buttonColor: 'bg-cyan-300 active:bg-cyan-400 text-cyan-950',
    buttonBorder: 'border-cyan-500 shadow-[0_4px_0_#0891b2]',
    shadowColor: 'shadow-yellow-900/30',
  },
};

export const BACKLIGHT_THEMES: Record<
  LcdBacklightId,
  {
    screenBg: string;
    screenText: string;
    matrixColor: string;
    borderGlow: string;
  }
> = {
  matrix_green: {
    screenBg: 'bg-[#98A886]',
    screenText: 'text-[#1E2616]',
    matrixColor: 'rgba(30, 38, 22, 0.08)',
    borderGlow: 'shadow-[inset_0_0_12px_rgba(0,0,0,0.18)]',
  },
  warm_amber: {
    screenBg: 'bg-[#F2CCA0]',
    screenText: 'text-[#3E2310]',
    matrixColor: 'rgba(62, 35, 16, 0.08)',
    borderGlow: 'shadow-[inset_0_0_12px_rgba(0,0,0,0.2)]',
  },
  cyber_blue: {
    screenBg: 'bg-[#A2C9D8]',
    screenText: 'text-[#102936]',
    matrixColor: 'rgba(16, 41, 54, 0.08)',
    borderGlow: 'shadow-[inset_0_0_12px_rgba(0,0,0,0.2)]',
  },
  classic_grey: {
    screenBg: 'bg-[#C2C7BA]',
    screenText: 'text-[#20241E]',
    matrixColor: 'rgba(32, 36, 30, 0.08)',
    borderGlow: 'shadow-[inset_0_0_12px_rgba(0,0,0,0.18)]',
  },
};

export const TamagotchiShell: React.FC<TamagotchiShellProps> = ({
  state,
  onSelectAction,
  onExecuteAction,
  onCancelAction,
  onDirectPetTouch,
  onDirectEggTap,
  children,
}) => {
  const [selectedIconIdx, setSelectedIconIdx] = useState<number | null>(null);
  const [catDirection, setCatDirection] = useState<'left' | 'right'>('right');
  const [catAction, setCatAction] = useState<
    'idle' | 'walk' | 'eat' | 'sleep' | 'happy' | 'sad' | 'sick' | 'naughty' | 'brush' | 'poop' | 'evolve'
  >('idle');

  const shellTheme = SHELL_THEMES[state.activeShell] || SHELL_THEMES.classic_pink;
  const backlightTheme = BACKLIGHT_THEMES[state.activeBacklight] || BACKLIGHT_THEMES.matrix_green;

  // Sync action with state
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

  // Button A: Select next icon
  const handleButtonA = () => {
    soundManager.playSelect();
    const nextIdx = selectedIconIdx === null ? 0 : (selectedIconIdx + 1) % MENU_ICONS.length;
    setSelectedIconIdx(nextIdx);
    onSelectAction(nextIdx);
  };

  // Button B: Confirm
  const handleButtonB = () => {
    if (selectedIconIdx !== null) {
      soundManager.playConfirm();
      onExecuteAction();
    } else {
      // Petting directly
      soundManager.playPurr();
      onDirectPetTouch();
    }
  };

  // Button C: Cancel / Deselect
  const handleButtonC = () => {
    soundManager.playCancel();
    setSelectedIconIdx(null);
    onCancelAction();
  };

  const isNight = state.inGameHour >= 20 || state.inGameHour < 6 || state.lightsOff;

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none">
      {/* Keychain Ring Loop */}
      <div className="flex flex-col items-center -mb-4 z-0">
        <div className="w-8 h-8 rounded-full border-4 border-slate-400 bg-slate-300 shadow-md" />
        <div className="w-4 h-4 rounded-full border-2 border-slate-400 bg-slate-200 -mt-1 shadow-sm" />
      </div>

      {/* Main Egg Shell Device Body */}
      <div
        className={`relative z-10 w-[330px] sm:w-[360px] h-[480px] sm:h-[510px] rounded-[180px/240px] bg-gradient-to-b ${shellTheme.outerGradient} p-6 sm:p-7 shadow-2xl border-4 ${shellTheme.borderAccent} flex flex-col items-center justify-between transition-colors duration-500`}
        style={{
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.35), inset 0 -8px 16px rgba(0,0,0,0.15)',
        }}
      >
        {/* Curved Plastic Highlight Reflection */}
        <div className="absolute top-4 left-12 w-28 h-10 rounded-full bg-white/40 blur-[1px] pointer-events-none -rotate-12" />

        {/* Brand Wordmark (Tamagotchi-style logo) */}
        <div className="text-center pt-1">
          <div className="font-pixel text-[13px] tracking-widest text-slate-800/80 font-black flex items-center justify-center gap-1">
            <span>★</span> <span>ね こ っ ち</span> <span>★</span>
          </div>
          <div className="text-[9px] font-pixel text-slate-700/60 tracking-wider">
            VIRTUAL CAT PET · Ver 1.0
          </div>
        </div>

        {/* Screen Bezel Housing */}
        <div className="w-full max-w-[280px] bg-slate-800/90 rounded-[36px] p-3 shadow-inner border-2 border-slate-700/80 flex flex-col items-center">
          {/* Top 4 Care Menu Icons */}
          <div className="grid grid-cols-4 w-full gap-1 mb-1.5 px-1">
            {MENU_ICONS.slice(0, 4).map((icon, idx) => {
              const isSelected = selectedIconIdx === idx;
              return (
                <button
                  key={icon.id}
                  onClick={() => {
                    soundManager.playSelect();
                    setSelectedIconIdx(idx);
                    onSelectAction(idx);
                  }}
                  className={`flex flex-col items-center justify-center py-1 rounded transition-transform ${
                    isSelected ? 'bg-amber-400 text-slate-950 font-bold scale-110 shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                  title={icon.label}
                >
                  <span className="text-sm">{icon.icon}</span>
                  <span className="text-[9px] font-pixel leading-none mt-0.5">{icon.label}</span>
                </button>
              );
            })}
          </div>

          {/* LCD Screen Display */}
          <div
            className={`relative w-full h-[190px] ${backlightTheme.screenBg} ${backlightTheme.screenText} ${backlightTheme.borderGlow} rounded-2xl overflow-hidden p-2.5 flex flex-col justify-between border-2 border-slate-900/30 lcd-screen-matrix`}
          >
            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 lcd-scanline pointer-events-none opacity-60 z-10" />

            {/* Screen Top Status Bar (Clock, Age, Coins) */}
            <div className="flex items-center justify-between text-[10px] font-pixel font-bold z-20 opacity-80 border-b border-black/10 pb-0.5">
              <span>{state.inGameHour}:00 {isNight ? '🌙' : '☀️'}</span>
              <span>{state.ageDays}日目 ({state.weight.toFixed(1)}kg)</span>
              <span>{state.coins}🪙</span>
            </div>

            {/* Room Background & Living Scene */}
            <div className="relative flex-1 flex items-center justify-center w-full z-10 overflow-hidden">
              {/* Window & Sky Backdrop */}
              <div className="absolute top-1 right-2 w-10 h-10 border border-black/20 rounded bg-black/5 flex items-center justify-center text-xs">
                {isNight ? '⭐' : '☁️'}
              </div>

              {/* Cat Food Bowl in corner */}
              <div className="absolute bottom-2 left-2 text-xs opacity-75">
                {state.hunger > 60 ? '🥣' : '🥣 (空)'}
              </div>

              {/* Poop sprites if room is dirty */}
              {state.poopCount > 0 && (
                <div className="absolute bottom-2 right-4 flex gap-1 animate-bounce text-sm">
                  {Array.from({ length: state.poopCount }).map((_, i) => (
                    <span key={i} title="うんち！トイレ掃除してね">💩</span>
                  ))}
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
                      onDirectPetTouch();
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
            <div className="text-[10px] font-pixel text-center z-20 opacity-80 truncate border-t border-black/10 pt-0.5">
              {!state.hatched
                ? 'たまごをタップして温めてね！'
                : state.isSick
                ? '⚠️ 具合が悪そう！お薬をあげよう'
                : state.isNaughty
                ? '⚡ いたずら中！しかる？'
                : state.poopCount > 0
                ? '🧹 うんちがあります！掃除してね'
                : state.hunger < 30
                ? '🍙 お腹がすいて鳴いています'
                : selectedIconIdx !== null
                ? `[B]ボタンで「${MENU_ICONS[selectedIconIdx].label}」実行`
                : `ごきげん:${state.happiness}% · [A]選択 [B]決定`}
            </div>
          </div>

          {/* Bottom 4 Care Menu Icons */}
          <div className="grid grid-cols-4 w-full gap-1 mt-1.5 px-1">
            {MENU_ICONS.slice(4, 8).map((icon, idx) => {
              const actualIdx = idx + 4;
              const isSelected = selectedIconIdx === actualIdx;
              return (
                <button
                  key={icon.id}
                  onClick={() => {
                    soundManager.playSelect();
                    setSelectedIconIdx(actualIdx);
                    onSelectAction(actualIdx);
                  }}
                  className={`flex flex-col items-center justify-center py-1 rounded transition-transform ${
                    isSelected ? 'bg-amber-400 text-slate-950 font-bold scale-110 shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                  title={icon.label}
                >
                  <span className="text-sm">{icon.icon}</span>
                  <span className="text-[9px] font-pixel leading-none mt-0.5">{icon.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Physical Authentic Tamagotchi Buttons */}
        <div className="flex items-center justify-center gap-7 pt-2 pb-1 w-full">
          {/* Button A: Select */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleButtonA}
              className={`w-11 h-11 rounded-full ${shellTheme.buttonColor} ${shellTheme.buttonBorder} border-2 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-retro text-xs font-black shadow-md`}
              title="Aボタン：メニュー選択 / 次へ"
            >
              A
            </button>
            <span className="text-[9px] font-pixel text-slate-800 font-bold mt-1">えらぶ</span>
          </div>

          {/* Button B: Execute (slightly raised / centered) */}
          <div className="flex flex-col items-center -translate-y-1.5">
            <button
              onClick={handleButtonB}
              className={`w-12 h-12 rounded-full ${shellTheme.buttonColor} ${shellTheme.buttonBorder} border-2 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-retro text-sm font-black shadow-lg`}
              title="Bボタン：けってい / なでなで"
            >
              B
            </button>
            <span className="text-[9px] font-pixel text-slate-800 font-bold mt-1">けってい</span>
          </div>

          {/* Button C: Cancel */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleButtonC}
              className={`w-11 h-11 rounded-full ${shellTheme.buttonColor} ${shellTheme.buttonBorder} border-2 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-retro text-xs font-black shadow-md`}
              title="Cボタン：もどる / とじる"
            >
              C
            </button>
            <span className="text-[9px] font-pixel text-slate-800 font-bold mt-1">もどる</span>
          </div>
        </div>
      </div>
    </div>
  );
};
