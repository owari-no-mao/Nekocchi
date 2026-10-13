import React, { useState } from 'react';
import { DailyCareTask, CareHistoryEntry, CatMemoryEntry } from '../types/game';
import { CAT_SPECIES } from '../types/cat';
import { CatSprite } from './CatSprite';
import { soundManager } from '../utils/audio';

interface DailyCareModalProps {
  tasks: DailyCareTask[];
  streakDays: number;
  history: CareHistoryEntry[];
  memories: CatMemoryEntry[];
  todayStr: string;
  onClaimTask: (taskId: string) => void;
  onAddUserMemory: (noteText: string, sticker?: string) => void;
  onClose: () => void;
}

export const DailyCareModal: React.FC<DailyCareModalProps> = ({
  tasks,
  streakDays,
  history,
  memories,
  todayStr,
  onClaimTask,
  onAddUserMemory,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'memories' | 'tasks'>('memories');
  const [filterCategory, setFilterCategory] = useState<'all' | 'evolution' | 'care' | 'user'>('all');
  const [customNote, setCustomNote] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('🐾');

  const STICKERS = ['🐾', '♥', '✨', '🐟', '💮', '💤', '👑'];

  const completedCount = tasks.filter((t) => t.completed).length;
  const isAllClear = completedCount === tasks.length;

  const filteredMemories = (memories || []).filter((m) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'evolution') return m.category === 'evolution';
    if (filterCategory === 'care') return m.category === 'care' || m.category === 'health' || m.category === 'play';
    if (filterCategory === 'user') return m.category === 'user';
    return true;
  });

  const handleSaveCustomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNote.trim()) {
      soundManager.playConfirm();
      onAddUserMemory(customNote.trim(), selectedSticker);
      setCustomNote('');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-700 animate-fadeIn max-h-[88vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📖</span>
          <div>
            <span className="font-pixel text-sm text-amber-400 font-bold">ねこっち手帳</span>
            <div className="text-[10px] text-slate-400 font-pixel">思い出日記 ＆ 毎日のお世話記録</div>
          </div>
        </div>
        <button
          onClick={() => {
            soundManager.playCancel();
            onClose();
          }}
          className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg transition-colors font-pixel"
        >
          とじる
        </button>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex gap-2 p-1 bg-slate-800/90 rounded-xl mb-3 shrink-0">
        <button
          onClick={() => {
            soundManager.playSelect();
            setActiveTab('memories');
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-pixel font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'memories'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📸</span>
          <span>思い出日記 ({memories?.length || 0})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playSelect();
            setActiveTab('tasks');
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-pixel font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tasks'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📅</span>
          <span>お世話ノルマ ({completedCount}/{tasks.length})</span>
        </button>
      </div>

      {/* Tab 1: Memories & Evolution Timeline Diary */}
      {activeTab === 'memories' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto no-scrollbar pb-0.5 shrink-0 text-[11px] font-pixel">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterCategory === 'all'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilterCategory('evolution')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterCategory === 'evolution'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              ✨ 進化の記録
            </button>
            <button
              onClick={() => setFilterCategory('care')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterCategory === 'care'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              💮 お世話の記録
            </button>
            <button
              onClick={() => setFilterCategory('user')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterCategory === 'user'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              🐾 飼い主のメモ
            </button>
          </div>

          {/* Quick Write Custom Note Form */}
          <form onSubmit={handleSaveCustomNote} className="mb-3 p-2.5 bg-slate-850 rounded-2xl border border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-pixel text-amber-300 flex items-center gap-1">
                <span>✏️</span> 今日のひとこと日記を書く
              </span>
              <div className="flex gap-1 text-xs">
                {STICKERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSticker(s)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-transform ${
                      selectedSticker === s ? 'bg-amber-500/30 scale-125' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                maxLength={60}
                placeholder="例: 今日はいっぱい撫でてあげたらゴロゴロ喜んでくれた！"
                className="flex-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!customNote.trim()}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-pixel text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
              >
                保存
              </button>
            </div>
          </form>

          {/* Memories Timeline Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredMemories.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-pixel">
                まだ思い出がありません。お世話や進化を進めると日記が自動で記録されます！
              </div>
            ) : (
              filteredMemories.map((entry) => {
                const species = CAT_SPECIES[entry.catId];

                return (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      entry.category === 'evolution'
                        ? 'bg-gradient-to-br from-amber-500/10 via-slate-850 to-slate-900 border-amber-500/40 shadow-sm'
                        : entry.category === 'user'
                        ? 'bg-slate-850 border-purple-500/30'
                        : 'bg-slate-850/80 border-slate-800'
                    }`}
                  >
                    {/* Entry Header */}
                    <div className="flex items-center justify-between text-[10px] font-pixel text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">{entry.sticker || '🐾'}</span>
                        <span className="text-amber-300 font-bold">生後{entry.inGameDay}日目</span>
                        <span>({entry.inGameHour}:00)</span>
                      </span>
                      <span className="text-slate-500">
                        {entry.dateStr}
                      </span>
                    </div>

                    {/* Entry Body with Photo Thumbnail */}
                    <div className="flex gap-3 items-start">
                      {/* Photo / Avatar */}
                      <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700/80 overflow-hidden shrink-0 shadow-inner flex items-center justify-center relative">
                        {entry.photoUrl ? (
                          <img
                            src={entry.photoUrl}
                            alt={entry.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <CatSprite catId={entry.catId} action="idle" className="scale-[0.65]" />
                        )}
                      </div>

                      {/* Text content */}
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-pixel text-xs font-bold text-white mb-1 leading-snug">
                          {entry.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {entry.story}
                        </p>
                        <div className="mt-1 text-[9px] font-pixel text-slate-400 flex items-center gap-2">
                          <span>猫種: {species?.name || 'ねこ'}</span>
                          <span>·</span>
                          <span>体重: {entry.weight.toFixed(1)}kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Daily Tasks & Streak Calendar */}
      {activeTab === 'tasks' && (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Streak & Hanamaru Status */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-3 rounded-2xl mb-3 flex items-center justify-between shrink-0">
            <div>
              <div className="text-[11px] text-amber-300 font-pixel">連続お世話ストリーク</div>
              <div className="text-2xl font-black text-amber-400 font-pixel tracking-wide flex items-center gap-1">
                🔥 {streakDays} <span className="text-xs font-normal text-slate-300">日連続</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                毎日のお世話記録が思い出手帳に刻まれます！
              </div>
            </div>

            {/* Hanamaru Stamp */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              {isAllClear ? (
                <div className="w-14 h-14 rounded-full border-4 border-red-500 flex flex-col items-center justify-center rotate-[-12deg] animate-scaleIn bg-red-500/10 text-red-500 font-black">
                  <span className="text-[10px] font-pixel leading-tight">たいへん</span>
                  <span className="text-[9px] font-pixel leading-tight">よくできました</span>
                  <span className="text-xs">💮</span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600 text-[10px]">
                  <span>未達成</span>
                  <span>({completedCount}/{tasks.length})</span>
                </div>
              )}
            </div>
          </div>

          {/* Daily Checklist Tasks */}
          <div className="space-y-1.5 mb-3 flex-1">
            <div className="flex items-center justify-between text-xs font-pixel text-slate-400 mb-1">
              <span>【 今日のノルマ 】</span>
              <span>達成率: <strong className="text-amber-300">{completedCount}</strong> / {tasks.length}</span>
            </div>

            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-slate-800/40 border-emerald-500/30 text-slate-400'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                      task.completed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 bg-slate-900'
                    }`}
                  >
                    {task.completed ? '✓' : ''}
                  </div>
                  <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.label}
                  </span>
                </div>

                <div className="text-[11px] font-pixel">
                  {task.completed ? (
                    <span className="text-emerald-400 text-[10px]">済 (+{task.rewardCoins}🪙)</span>
                  ) : (
                    <span className="text-amber-400 text-[10px]">+{task.rewardCoins}🪙</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Past Calendar History */}
          <div className="border-t border-slate-800 pt-2.5 shrink-0">
            <div className="text-xs font-pixel text-slate-400 mb-1.5">【 最近のお世話達成履歴 】</div>
            {history.length === 0 ? (
              <div className="text-[11px] text-slate-500 italic py-1 text-center font-pixel">
                毎日のお世話結果がスタンプとして記録されます。
              </div>
            ) : (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 bg-slate-950/60 rounded text-[11px]">
                    <span className="text-slate-400 font-pixel">{h.date}</span>
                    <span className="text-slate-300">達成: {h.tasksCompleted}/{h.totalTasks}</span>
                    <span>{h.allClear ? '💮 皆勤花丸' : '🐾 お世話完了'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
