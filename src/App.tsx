import React from 'react';
import { usePetGame } from './hooks/usePetGame';
import { TopNav } from './components/TopNav';
import { TamagotchiShell } from './components/TamagotchiShell';
import { MiniGames } from './components/MiniGames';
import { StatusModal } from './components/StatusModal';
import { ZukanModal } from './components/ZukanModal';
import { EvolutionTreeModal } from './components/EvolutionTreeModal';
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
    actionFeedback,
    evolutionPending,
    setEvolutionPending,
    handleEggTap,
    handleInstantMeal,
    handleInstantSnack,
    handleInstantClean,
    handleInstantPet,
    handleInstantHeal,
    handleMiniGameComplete,
    handleToggleLight,
    handleAdvanceHours,
    handleAdvanceDays,
    handleForceEvolve,
    handleAddUserMemory,
    handleRename,
    handleBuyItem,
    handleSetShell,
    handleSetBacklight,
    handleResetGame,
    handleToggleSound,
  } = usePetGame();

  const currentSpecies = CAT_SPECIES[state.catId];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Sleek Top Bar Contract Header */}
      <TopNav
        coins={state.coins}
        streakDays={state.streakDays}
        soundEnabled={state.soundEnabled}
        onOpenModal={(modal) => setActiveModal(modal)}
        onToggleSound={handleToggleSound}
        onResetGame={handleResetGame}
      />

      {/* Main Play Viewport (MVP Focused & Stylish) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-8 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          
          {/* Virtual Pet Hardware Device (Center of Play) */}
          <div className="flex flex-col items-center">
            <TamagotchiShell
              state={state}
              onFeedMeal={handleInstantMeal}
              onFeedSnack={handleInstantSnack}
              onCleanToilet={handleInstantClean}
              onPetOrBrush={handleInstantPet}
              onToggleLight={handleToggleLight}
              onPlayGame={() => setActiveModal('menu_play')}
              onHeal={handleInstantHeal}
              onDirectEggTap={handleEggTap}
              onOpenEvolutionTree={() => setActiveModal('evolution_tree')}
              actionFeedback={actionFeedback}
            />

            {/* Quick Authentic Tamagotchi Hardware Control Legend */}
            <div className="mt-2.5 text-center text-xs font-pixel text-slate-400 flex items-center gap-3">
              <span>【A】えらぶ</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 font-bold">【B】即実行 / なでる</span>
              <span aria-hidden="true">·</span>
              <span>【C】もどる</span>
            </div>
          </div>

          {/* Sleek MVP Companion Card (Character, Live Vitals, Next Evolution Shortcut) */}
          <div className="w-full max-w-sm flex flex-col gap-3">
            {/* Identity & 3D Collectible Figure Card */}
            <div className="bg-slate-800/90 rounded-3xl p-4 sm:p-5 border border-slate-700/80 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
                <div className="overflow-hidden">
                  <div className="font-pixel text-xs text-amber-400 font-bold truncate">
                    {currentSpecies.title}
                  </div>
                  <h3 className="font-black text-lg text-white font-pixel truncate">
                    {state.catName} <span className="text-xs text-slate-400 font-normal">({currentSpecies.name})</span>
                  </h3>
                </div>

                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setActiveModal('menu_status');
                  }}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-650 text-slate-300 hover:text-white rounded-lg text-xs font-pixel border border-slate-600 transition-colors shrink-0"
                >
                  手帳 ✏️
                </button>
              </div>

              {/* 3D Collectible Figure Showcase (If image available) */}
              {currentSpecies.aiImageUrl && (
                <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3 border border-amber-400/30 shadow-inner group bg-slate-950">
                  <img
                    src={currentSpecies.aiImageUrl}
                    alt={currentSpecies.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-pixel bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    ★ AI 3D COLLECTIBLE
                  </span>
                  <span className="absolute top-2 right-2 text-xs font-pixel bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded-md">
                    {state.ageDays}日目 ({state.weight.toFixed(1)}kg)
                  </span>
                </div>
              )}

              {/* Live Vitals Bars */}
              <div className="space-y-2.5 mb-4">
                <div>
                  <div className="flex justify-between text-xs font-pixel mb-1">
                    <span className="text-slate-300">🍙 まんぷく度</span>
                    <span className="text-amber-400 font-bold">{state.hunger}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-300 ${state.hunger > 40 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${state.hunger}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-pixel mb-1">
                    <span className="text-slate-300">♪ ごきげん</span>
                    <span className="text-amber-400 font-bold">{state.happiness}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-300 ${state.happiness > 40 ? 'bg-amber-400' : 'bg-red-500'}`}
                      style={{ width: `${state.happiness}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-pixel mb-1">
                    <span className="text-slate-300">✨ せいけつ度</span>
                    <span className="text-amber-400 font-bold">{state.cleanliness}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-300 ${state.cleanliness > 40 ? 'bg-sky-400' : 'bg-red-500'}`}
                      style={{ width: `${state.cleanliness}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Direct Evolution Tree CTA */}
              <button
                onClick={() => {
                  soundManager.playConfirm();
                  setActiveModal('evolution_tree');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white rounded-2xl font-pixel text-xs font-black shadow-lg flex items-center justify-center gap-2 border border-emerald-400/40 transition-all cursor-pointer"
              >
                <span>🌿</span>
                <span>進化系統ツリーで次の候補を見る →</span>
              </button>
            </div>

            {/* Quick MVP Shortcuts */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setActiveModal('daily_care');
                }}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-pixel border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                📖 思い出手帳
              </button>
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setActiveModal('zukan');
                }}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-pixel border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                📖 図鑑
              </button>
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setActiveModal('time_machine');
                }}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-pixel border border-amber-500/30 transition-colors flex items-center justify-center gap-1"
              >
                ⏳ 時間操作
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Modals System */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3">
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
              onOpenEvolutionTree={() => setActiveModal('evolution_tree')}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'evolution_tree' && (
            <EvolutionTreeModal
              state={state}
              onClose={() => setActiveModal(null)}
            />
          )}

          {activeModal === 'daily_care' && (
            <DailyCareModal
              tasks={state.dailyTasks}
              streakDays={state.streakDays}
              history={state.careHistory}
              memories={state.memories}
              todayStr={state.currentDateStr}
              onClaimTask={() => {}}
              onAddUserMemory={handleAddUserMemory}
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
      <footer className="w-full text-center py-3 border-t border-slate-800 text-xs text-slate-500 font-pixel">
        ねこっち · バーチャルペット MVP © 2026
      </footer>
    </div>
  );
}
