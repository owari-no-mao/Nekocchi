import React from 'react';
import { DailyCareTask, CareHistoryEntry } from '../types/game';
import { soundManager } from '../utils/audio';

interface DailyCareModalProps {
  tasks: DailyCareTask[];
  streakDays: number;
  history: CareHistoryEntry[];
  todayStr: string;
  onClaimTask: (taskId: string) => void;
  onClose: () => void;
}

export const DailyCareModal: React.FC<DailyCareModalProps> = ({
  tasks,
  streakDays,
  history,
  todayStr,
  onClaimTask,
  onClose,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;
  const isAllClear = completedCount === tasks.length;

  return (
    <div className="flex flex-col w-full max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 animate-fadeIn max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <div>
            <span className="font-pixel text-sm text-amber-400">毎日のお世話手帳</span>
            <div className="text-[10px] text-slate-400">日付: {todayStr}</div>
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

      {/* Streak & Hanamaru Stamp Status */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-3 rounded-xl mb-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-amber-300 font-pixel">連続お世話ストリーク</div>
          <div className="text-2xl font-black text-amber-400 font-pixel tracking-wide flex items-center gap-1">
            🔥 {streakDays} <span className="text-xs font-normal text-slate-300">日連続</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            毎日欠かさずお世話すると、特別な猫へ進化しやすくなります！
          </div>
        </div>

        {/* Hanamaru Stamp */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {isAllClear ? (
            <div className="w-16 h-16 rounded-full border-4 border-red-500 flex flex-col items-center justify-center rotate-[-12deg] animate-scaleIn bg-red-500/10 text-red-500 font-black">
              <span className="text-xs font-pixel leading-tight">たいへん</span>
              <span className="text-[10px] font-pixel leading-tight">よくできました</span>
              <span className="text-sm">💮</span>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600 text-[10px]">
              <span>未達成</span>
              <span>({completedCount}/{tasks.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Checklist Tasks */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs font-pixel text-slate-400">
          <span>【 今日のノルマ 】</span>
          <span>
            達成率: <strong className="text-amber-300">{completedCount}</strong> / {tasks.length}
          </span>
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

            <div className="flex items-center gap-1 text-[11px] font-pixel">
              {task.completed ? (
                <span className="text-emerald-400 text-[10px]">済 (+{task.rewardCoins}🪙)</span>
              ) : (
                <span className="text-amber-400 text-[10px]">+{task.rewardCoins}🪙</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Past Calendar Care History */}
      <div className="border-t border-slate-800 pt-2.5">
        <div className="text-xs font-pixel text-slate-400 mb-1.5">【 最近のお世話履歴 】</div>
        {history.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic py-2 text-center">
            明日以降、毎日のお世話結果がここにスタンプ帳として記録されます。
          </div>
        ) : (
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 bg-slate-950/60 rounded text-[11px]">
                <span className="text-slate-400">{h.date}</span>
                <span className="text-slate-300">
                  達成: {h.tasksCompleted}/{h.totalTasks}
                </span>
                <span>{h.allClear ? '💮 皆勤花丸' : '🐾 お世話完了'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
