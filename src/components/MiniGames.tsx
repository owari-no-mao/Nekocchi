import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../utils/audio';

interface MiniGamesProps {
  onGameComplete: (score: number, coinsEarned: number) => void;
  onClose: () => void;
}

type GameType = 'wand' | 'fish' | 'yarn';

export const MiniGames: React.FC<MiniGamesProps> = ({ onGameComplete, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('wand');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // --- Game 1: Cat Wand Catch State ---
  const [targetZone, setTargetZone] = useState({ x: 50, active: false });
  const [wandPos, setWandPos] = useState(10);
  const [wandDir, setWandDir] = useState(1);
  const [wandRounds, setWandRounds] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Game 2: Fish Catcher State ---
  const [basketX, setBasketX] = useState(50);
  const [fallingItems, setFallingItems] = useState<Array<{ id: number; x: number; y: number; type: 'fish' | 'bad' }>>([]);
  const [fishTimeLeft, setFishTimeLeft] = useState(15);

  // --- Game 3: Yarn Ball Juggling State ---
  const [yarnY, setYarnY] = useState(20);
  const [yarnVy, setYarnVy] = useState(2);
  const [combo, setCombo] = useState(0);

  // Wand Game Loop
  useEffect(() => {
    if (!isPlaying || selectedGame !== 'wand' || gameOver) return;
    const interval = setInterval(() => {
      setWandPos((prev) => {
        let next = prev + wandDir * 3.5;
        if (next >= 85) {
          setWandDir(-1);
          next = 85;
        } else if (next <= 15) {
          setWandDir(1);
          next = 15;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, selectedGame, wandDir, gameOver]);

  // Wand Tap Action
  const handleWandTap = () => {
    if (!isPlaying || selectedGame !== 'wand' || gameOver) return;
    const dist = Math.abs(wandPos - targetZone.x);
    if (dist <= 10) {
      soundManager.playMiniGameScore();
      setScore((s) => s + 30);
      setFeedback('大成功！！ PERFECT');
    } else if (dist <= 20) {
      soundManager.playConfirm();
      setScore((s) => s + 15);
      setFeedback('ナイス！ GOOD');
    } else {
      soundManager.playCancel();
      setFeedback('おしい！ MISS');
    }

    // Change target position for next round
    const nextRound = wandRounds + 1;
    setWandRounds(nextRound);
    setTargetZone({ x: 25 + Math.floor(Math.random() * 50), active: true });

    if (nextRound >= 5) {
      setGameOver(true);
      setTimeout(() => {
        const finalCoins = Math.max(10, Math.floor((score + 20) / 2));
        onGameComplete(score, finalCoins);
      }, 1200);
    }
  };

  // Fish Catch Loop
  useEffect(() => {
    if (!isPlaying || selectedGame !== 'fish' || gameOver) return;

    // Timer countdown
    const timer = setInterval(() => {
      setFishTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          const finalCoins = Math.max(10, Math.floor(score / 2));
          setTimeout(() => onGameComplete(score, finalCoins), 1000);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Spawner
    const spawner = setInterval(() => {
      if (Math.random() > 0.3) {
        setFallingItems((items) => [
          ...items,
          {
            id: Date.now() + Math.random(),
            x: 15 + Math.random() * 70,
            y: 0,
            type: Math.random() > 0.25 ? 'fish' : 'bad',
          },
        ]);
      }
    }, 700);

    // Physics Loop
    const physics = setInterval(() => {
      setFallingItems((items) => {
        const nextItems: typeof items = [];
        for (const item of items) {
          const nextY = item.y + 4;
          // Check collision with basket at bottom (y ~ 80)
          if (nextY >= 75 && nextY <= 88 && Math.abs(item.x - basketX) < 18) {
            if (item.type === 'fish') {
              soundManager.playMiniGameScore();
              setScore((s) => s + 20);
            } else {
              soundManager.playCancel();
              setScore((s) => Math.max(0, s - 15));
            }
            continue; // Caught!
          }
          if (nextY < 95) {
            nextItems.push({ ...item, y: nextY });
          }
        }
        return nextItems;
      });
    }, 50);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
      clearInterval(physics);
    };
  }, [isPlaying, selectedGame, gameOver, basketX, score, onGameComplete]);

  // Yarn Game Physics Loop
  useEffect(() => {
    if (!isPlaying || selectedGame !== 'yarn' || gameOver) return;
    const interval = setInterval(() => {
      setYarnY((y) => {
        const next = y + yarnVy;
        // Gravity
        setYarnVy((v) => v + 0.4);
        if (next >= 85) {
          // Missed floor!
          soundManager.playCancel();
          setGameOver(true);
          const finalCoins = Math.max(10, Math.floor((combo * 15) / 2));
          setTimeout(() => onGameComplete(combo * 15, finalCoins), 1000);
          return 85;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, selectedGame, gameOver, yarnVy, combo, onGameComplete]);

  const handleYarnHit = () => {
    if (!isPlaying || selectedGame !== 'yarn' || gameOver) return;
    if (yarnY >= 45 && yarnY <= 82) {
      soundManager.playMiniGameScore();
      setYarnVy(-7);
      setCombo((c) => c + 1);
      setScore((s) => s + 10 * (combo + 1));
      setFeedback(`COMBO x${combo + 1}!`);
    } else {
      soundManager.playCancel();
      setFeedback('スカッ！タイミングが早い！');
    }
  };

  const startGame = (type: GameType) => {
    soundManager.playConfirm();
    setSelectedGame(type);
    setIsPlaying(true);
    setScore(0);
    setGameOver(false);
    setFeedback(null);
    setWandRounds(0);
    setTargetZone({ x: 50, active: true });
    setBasketX(50);
    setFallingItems([]);
    setFishTimeLeft(15);
    setYarnY(20);
    setYarnVy(2);
    setCombo(0);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700">
      {/* Mini-game header */}
      <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2 mb-3">
        <div className="font-pixel text-amber-400 text-sm tracking-wider">
          ★ にゃんこミニゲーム ★
        </div>
        <button
          onClick={() => {
            soundManager.playCancel();
            onClose();
          }}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded transition-colors"
        >
          もどる
        </button>
      </div>

      {!isPlaying ? (
        // Mini Game Selection Menu
        <div className="flex flex-col gap-2.5 w-full">
          <p className="text-xs text-slate-300 text-center mb-1">
            遊ぶゲームを選んでね！遊ぶとごきげん＆コインUP！
          </p>

          <button
            onClick={() => startGame('wand')}
            className="flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-amber-500/30 transition-all text-left group"
          >
            <div>
              <div className="font-pixel text-sm text-amber-300 group-hover:text-amber-200">
                1. ねこじゃらしキャッチ
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                タイミングよくボタンを押して獲物を捕まえろ！
              </div>
            </div>
            <span className="text-xl">🪶</span>
          </button>

          <button
            onClick={() => startGame('fish')}
            className="flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-cyan-500/30 transition-all text-left group"
          >
            <div>
              <div className="font-pixel text-sm text-cyan-300 group-hover:text-cyan-200">
                2. おさかなキャッチ
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                落ちてくるおいしい魚をカゴでキャッチ！
              </div>
            </div>
            <span className="text-xl">🐟</span>
          </button>

          <button
            onClick={() => startGame('yarn')}
            className="flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-pink-500/30 transition-all text-left group"
          >
            <div>
              <div className="font-pixel text-sm text-pink-300 group-hover:text-pink-200">
                3. 毛玉ポンポンリフティング
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                毛玉を落とさずに猫パンチで連続ジャグリング！
              </div>
            </div>
            <span className="text-xl">🧶</span>
          </button>
        </div>
      ) : (
        // Active Mini Game Canvas & Controls
        <div className="flex flex-col items-center w-full">
          {/* HUD Bar */}
          <div className="flex justify-between w-full text-xs font-pixel mb-2 px-1 text-slate-300">
            <span>SCORE: <strong className="text-amber-400">{score}</strong></span>
            {selectedGame === 'fish' && (
              <span>TIME: <strong className="text-cyan-400">{fishTimeLeft}s</strong></span>
            )}
            {selectedGame === 'wand' && (
              <span>ROUND: <strong className="text-amber-400">{wandRounds}/5</strong></span>
            )}
            {selectedGame === 'yarn' && (
              <span>COMBO: <strong className="text-pink-400">{combo}回</strong></span>
            )}
          </div>

          {/* Retro Game Screen (LCD Matrix) */}
          <div className="relative w-full h-44 bg-[#9CA38F] border-4 border-slate-700 rounded-lg overflow-hidden lcd-screen-matrix p-2 select-none">
            {/* Feedback alert */}
            {feedback && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 font-pixel text-xs bg-slate-900/80 text-amber-300 px-2 py-0.5 rounded shadow z-20 pointer-events-none">
                {feedback}
              </div>
            )}

            {/* Game 1: Cat Wand */}
            {selectedGame === 'wand' && (
              <div className="relative w-full h-full">
                {/* Target Zone Circle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-dashed border-red-700 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-none"
                  style={{ left: `${targetZone.x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <span className="text-[10px] font-pixel text-red-900">TARGET</span>
                </div>

                {/* Moving Wand / Feather */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 text-2xl transition-transform"
                  style={{ left: `${wandPos}%`, transform: 'translate(-50%, -50%)' }}
                >
                  🪶
                </div>

                {/* Patient Cat waiting at bottom */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xl">
                  🐱
                </div>
              </div>
            )}

            {/* Game 2: Fish Catcher */}
            {selectedGame === 'fish' && (
              <div className="relative w-full h-full">
                {/* Falling items */}
                {fallingItems.map((item) => (
                  <div
                    key={item.id}
                    className="absolute text-base transition-all"
                    style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    {item.type === 'fish' ? '🐟' : '🪨'}
                  </div>
                ))}

                {/* Basket Cat */}
                <div
                  className="absolute bottom-1 flex flex-col items-center transition-all duration-75"
                  style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
                >
                  <span className="text-lg">🧺</span>
                </div>
              </div>
            )}

            {/* Game 3: Yarn Bounce */}
            {selectedGame === 'yarn' && (
              <div className="relative w-full h-full">
                {/* Bouncing Yarn Ball */}
                <div
                  className="absolute left-1/2 text-xl transition-all"
                  style={{ top: `${yarnY}%`, transform: 'translate(-50%, -50%)' }}
                >
                  🧶
                </div>

                {/* Hit Zone Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-6 border border-emerald-800/40 bg-emerald-700/10 rounded flex items-center justify-center text-[10px] font-pixel text-emerald-900 pointer-events-none">
                  HIT ZONE
                </div>

                {/* Cat Paws at bottom */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-2xl">
                  🐾
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-3 text-center z-30">
                <div className="font-pixel text-amber-400 text-sm mb-1">GAME FINISHED!</div>
                <div className="text-xs text-white mb-2">
                  スコア: <strong className="text-amber-300">{score}点</strong>
                </div>
                <div className="text-[11px] text-emerald-300 font-pixel">
                  ＋ごきげん回復 & コインGET！
                </div>
              </div>
            )}
          </div>

          {/* Interactive Game Action Buttons */}
          <div className="flex gap-2 w-full mt-3">
            {selectedGame === 'wand' && (
              <button
                onClick={handleWandTap}
                disabled={gameOver}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-pixel text-sm font-bold rounded-xl shadow-lg transition-transform"
              >
                今だ！ CATCH! [スペース/タップ]
              </button>
            )}

            {selectedGame === 'fish' && (
              <>
                <button
                  onClick={() => setBasketX((x) => Math.max(15, x - 18))}
                  disabled={gameOver}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-pixel text-sm rounded-xl border border-slate-700"
                >
                  ◀ ひだり
                </button>
                <button
                  onClick={() => setBasketX((x) => Math.min(85, x + 18))}
                  disabled={gameOver}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-pixel text-sm rounded-xl border border-slate-700"
                >
                  みぎ ▶
                </button>
              </>
            )}

            {selectedGame === 'yarn' && (
              <button
                onClick={handleYarnHit}
                disabled={gameOver}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-400 active:scale-95 text-white font-pixel text-sm font-bold rounded-xl shadow-lg transition-transform"
              >
                ポンッ！ BOUNCE! [スペース/タップ]
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
