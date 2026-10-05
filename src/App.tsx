import React from 'react';
import { usePetGame } from './hooks/usePetGame';
import { TopNav } from './components/TopNav';
import { TamagotchiShell, MENU_ICONS } from './components/TamagotchiShell';
import { CareMenu } from './components/CareMenu';
import { MiniGames } from './components/MiniGames';
import { StatusModal } from './components/StatusModal';
import { ZukanModal } from './components/ZukanModal';
import { DailyCareModal } from './components/DailyCareModal';
import { ShopModal } from './components/ShopModal';
import { ClockControlModal } from './components/ClockControlModal';
import { EvolutionCeremonyModal } from './components/EvolutionCeremonyModal';
import { CAT_SPECIES } from './types/cat';
import { soundManager } from './utils/audio';

export default function App() {
  const {
    state,
    activeModal,
    setActiveModal,
    selectedMenuIdx,
    setSelectedMenuIdx,
    evolutionPending,
    setEvolutionPending,
    handleEggTap,
    handleDirectPetTouch,
    handleFeedMeal,
    handleFeedSnack,
    handleCleanToilet,
    handleBath,
    handleBrush,
    handleScold,
    handlePraise,
    handleHeal,
    handleMiniGameComplete,
    handleToggleLight,
    handleExecuteSelectedIcon,
    handleAdvanceHours,
    handleAdvanceDays,
    handleForceEvolve,
    handleRename,
    handleBuyItem,
    handleSetShell,
    handleSetBacklight,
    handleResetGame,
    handleToggleSound,
  } = usePetGame();

  const currentSpecies = CAT_SPECIES[state.catId];
  const completedTasksCount = state.dailyTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Bar Contract compliant Header */}
      <TopNav
        coins={state.coins}
        streakDays={state.streakDays}
        soundEnabled={state.soundEnabled}
        onOpenModal={(modal) => setActiveModal(modal)}
        onToggleSound={handleToggleSound}
        onResetGame={handleResetGame}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
        {/* Desktop 3-column layout (Cards & Tamagotchi Shell) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start justify-center">
          
          {/* Left Column (Desktop): Daily Care & Routine Widget */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            {/* Daily Care Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-pixel text-xs font-bold text-slate-800">
                  📅 今日のお世話ノルマ
                </span>
                <span className="text-[11px] font-pixel text-amber-600 font-bold">
                  {completedTasksCount} / {state.dailyTasks.length}
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                {state.dailyTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between text-xs p-1.5 rounded-lg ${
                      t.completed ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600'
                    }`}
                  >
                    <span className="truncate">{t.completed ? '✓ ' : '○ '}{t.label}</span>
                    <span className="font-pixel text-[10px] text-amber-600">+{t.rewardCoins}🪙</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  soundManager.playSelect();
                  setActiveModal('daily_care');
                }}
                className="w-full py-1.5 text-xs text-center font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200"
              >
                お世話手帳を開く →
              </button>
            </div>

            {/* Quick Care Actions Palette */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <div className="font-pixel text-xs font-bold text-slate-800 mb-2 pb-1 border-b border-slate-100">
                ⚡ クイックお世話
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setActiveModal('menu_food');
                  }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-xl">🍙</span>
                  <span className="font-pixel text-[11px]">ごはん・おやつ</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playBrush();
                    handleBrush();
                  }}
                  className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-xl">✨</span>
                  <span className="font-pixel text-[11px]">ブラッシング</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClean();
                    handleCleanToilet();
                  }}
                  className="p-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-xl">🧹</span>
                  <span className="font-pixel text-[11px]">トイレ掃除</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setActiveModal('menu_play');
                  }}
                  className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-xl">🎾</span>
                  <span className="font-pixel text-[11px]">ミニゲーム</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center Column: The Virtual Pet Tamagotchi Machine */}
          <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center">
            <TamagotchiShell
              state={state}
              onSelectAction={(idx) => setSelectedMenuIdx(idx)}
              onExecuteAction={() => {
                if (selectedMenuIdx !== null) {
                  handleExecuteSelectedIcon(selectedMenuIdx);
                }
              }}
              onCancelAction={() => {
                setSelectedMenuIdx(null);
                setActiveModal(null);
              }}
              onDirectPetTouch={handleDirectPetTouch}
              onDirectEggTap={handleEggTap}
            />

            {/* Hardware instruction key guide */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500 font-pixel">
              <span>[A] メニュー選択</span>
              <span aria-hidden="true">·</span>
              <span>[B] 決定 / なでる</span>
              <span aria-hidden="true">·</span>
              <span>[C] もどる</span>
            </div>
          </div>

          {/* Right Column (Desktop): Pet Identity & Vitals Snapshot */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            {/* Identity & Evolution Stage Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div>
                  <div className="font-pixel text-xs text-amber-600">{currentSpecies.title}</div>
                  <h3 className="font-bold text-sm text-slate-900">{state.catName} ({currentSpecies.name})</h3>
                </div>
                <span className="text-2xl">
                  {currentSpecies.stage === 'egg' ? '🥚' : currentSpecies.stage === 'baby' ? '🐾' : currentSpecies.stage === 'child' ? '🐈' : '👑'}
                </span>
              </div>

              {/* Vitals Bars Snapshot */}
              <div className="space-y-2 mb-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span>まんぷく度</span>
                    <span className="font-pixel">{state.hunger}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${state.hunger > 50 ? 'bg-emerald-500' : 'bg-red-400'}`}
                      style={{ width: `${state.hunger}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span>ごきげん</span>
                    <span className="font-pixel">{state.happiness}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${state.happiness > 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${state.happiness}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span>せいけつ度</span>
                    <span className="font-pixel">{state.cleanliness}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${state.cleanliness > 50 ? 'bg-sky-400' : 'bg-red-400'}`}
                      style={{ width: `${state.cleanliness}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed mb-3">
                <span className="font-bold text-slate-800">💡 成長のヒント: </span>
                {currentSpecies.evolutionHint}
              </div>

              <button
                onClick={() => {
                  soundManager.playSelect();
                  setActiveModal('zukan');
                }}
                className="w-full py-1.5 text-xs text-center font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors border border-amber-200"
              >
                進化図鑑 (全15種) を見る →
              </button>
            </div>

            {/* Quick Actions (Shop & Fast-Forward) */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setActiveModal('shop');
                }}
                className="flex-1 p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-pixel text-slate-700 flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                🛍️ ショップ
              </button>
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setActiveModal('time_machine');
                }}
                className="flex-1 p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-pixel text-amber-700 flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                ⏳ 時間操作
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Quick Action Buttons Bar */}
        <div className="lg:hidden flex flex-wrap items-center justify-center gap-2 mt-4 w-full max-w-sm">
          <button
            onClick={() => {
              soundManager.playSelect();
              setActiveModal('daily_care');
            }}
            className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-pixel text-slate-700 shadow-sm"
          >
            📅 お世話手帳
          </button>
          <button
            onClick={() => {
              soundManager.playSelect();
              setActiveModal('zukan');
            }}
            className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-pixel text-slate-700 shadow-sm"
          >
            📖 進化図鑑
          </button>
          <button
            onClick={() => {
              soundManager.playSelect();
              setActiveModal('menu_play');
            }}
            className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-pixel text-slate-700 shadow-sm"
          >
            🎾 ミニゲーム
          </button>
        </div>
      </main>

      {/* Floating Modals System */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          {activeModal === 'menu_food' && (
            <CareMenu
              type="food"
              coins={state.coins}
              onFeedMeal={handleFeedMeal}
              onFeedSnack={handleFeedSnack}
              onCleanToilet={handleCleanToilet}
              onBath={handleBath}
              onScold={handleScold}
              onPraise={handlePraise}
              onHeal={handleHeal}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'menu_clean' && (
            <CareMenu
              type="clean"
              coins={state.coins}
              onFeedMeal={handleFeedMeal}
              onFeedSnack={handleFeedSnack}
              onCleanToilet={handleCleanToilet}
              onBath={handleBath}
              onScold={handleScold}
              onPraise={handlePraise}
              onHeal={handleHeal}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'menu_discipline' && (
            <CareMenu
              type="discipline"
              coins={state.coins}
              onFeedMeal={handleFeedMeal}
              onFeedSnack={handleFeedSnack}
              onCleanToilet={handleCleanToilet}
              onBath={handleBath}
              onScold={handleScold}
              onPraise={handlePraise}
              onHeal={handleHeal}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'menu_medicine' && (
            <CareMenu
              type="medicine"
              coins={state.coins}
              onFeedMeal={handleFeedMeal}
              onFeedSnack={handleFeedSnack}
              onCleanToilet={handleCleanToilet}
              onBath={handleBath}
              onScold={handleScold}
              onPraise={handlePraise}
              onHeal={handleHeal}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'menu_play' && (
            <MiniGames
              onGameComplete={(score, coins) => {
                handleMiniGameComplete(score, coins);
                setActiveModal(null);
              }}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'menu_status' && (
            <StatusModal
              state={state}
              onRename={handleRename}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'zukan' && (
            <ZukanModal
              unlockedList={state.unlockedZukan}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'daily_care' && (
            <DailyCareModal
              tasks={state.dailyTasks}
              streakDays={state.streakDays}
              history={state.careHistory}
              todayStr={state.currentDateStr}
              onClaimTask={() => {}}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'shop' && (
            <ShopModal
              coins={state.coins}
              ownedItems={state.ownedItems}
              activeShell={state.activeShell}
              activeBacklight={state.activeBacklight}
              onBuyItem={handleBuyItem}
              onSetShell={handleSetShell}
              onSetBacklight={handleSetBacklight}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'time_machine' && (
            <ClockControlModal
              currentAge={state.ageDays}
              inGameHour={state.inGameHour}
              onAdvanceHours={handleAdvanceHours}
              onAdvanceDays={handleAdvanceDays}
              onTriggerEggHatch={handleEggTap}
              onTriggerFastEvolve={handleForceEvolve}
              onClose={() => setActiveModal(null)}
            />
          )}
        </div>
      )}

      {/* Evolution Celebration Fanfare Modal */}
      {evolutionPending && (
        <EvolutionCeremonyModal
          previousCatId={evolutionPending.previousCatId}
          newCatId={evolutionPending.newCatId}
          reason={evolutionPending.reason}
          onClose={() => setEvolutionPending(null)}
        />
      )}

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t border-slate-200/60 text-xs text-slate-500 font-pixel">
        ねこっち · レトロにゃんこバーチャルペット © 2026
      </footer>
    </div>
  );
}
