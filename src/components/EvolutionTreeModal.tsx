import React, { useState, useRef, useEffect } from 'react';
import { PetGameState } from '../types/game';
import { CatEvolutionId, CAT_SPECIES } from '../types/cat';
import { TREE_NODES, TREE_EDGES, TreeNodeData, getNextEvolutionCandidates } from '../utils/treeData';
import { CatSprite } from './CatSprite';
import { soundManager } from '../utils/audio';

interface EvolutionTreeModalProps {
  state: PetGameState;
  onClose: () => void;
  onSelectCatDetail?: (catId: CatEvolutionId) => void;
}

const STAGES = [
  { id: 'egg', label: 'たまご期', desc: '命の目覚め' },
  { id: 'baby', label: 'あかちゃん期', desc: 'すくすく成長' },
  { id: 'child', label: 'こども期', desc: '遊びとお世話で分岐' },
  { id: 'adult', label: '成猫期', desc: '育ち方で個性豊かな姿へ' },
  { id: 'legendary', label: '伝説神猫期', desc: '長寿と深い絆の結晶' },
];

export const EvolutionTreeModal: React.FC<EvolutionTreeModalProps> = ({ state, onClose }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<CatEvolutionId>(state.catId);
  const [filterMode, setFilterMode] = useState<'all' | 'my_path' | 'locked'>('all');
  const [viewGraphicMode, setViewGraphicMode] = useState<'3d' | 'pixel'>('3d');
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  const nextCandidates = getNextEvolutionCandidates(state.catId);
  const unlockedCount = state.unlockedZukan.length;
  const totalCount = TREE_NODES.length;
  const collectionPercent = Math.round((unlockedCount / totalCount) * 100);

  // Measure card positions to draw SVG connecting lines between parent and child nodes
  const updatePositions = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPos: Record<string, { x: number; y: number }> = {};

    TREE_NODES.forEach((node) => {
      const el = document.getElementById(`tree-node-${node.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        newPos[node.id] = {
          x: rect.left - containerRect.left + rect.width / 2 + containerRef.current!.scrollLeft,
          y: rect.top - containerRect.top + rect.height / 2 + containerRef.current!.scrollTop,
        };
      }
    });

    setNodePositions(newPos);
  };

  useEffect(() => {
    updatePositions();
    const timer = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, [filterMode, selectedNodeId]);

  // Selected node info
  const selectedNodeData = TREE_NODES.find((n) => n.id === selectedNodeId) || TREE_NODES[0];
  const selectedSpecies = CAT_SPECIES[selectedNodeId] || CAT_SPECIES.cat_egg;
  const isSelectedUnlocked = state.unlockedZukan.includes(selectedNodeId);
  const isSelectedCurrent = state.catId === selectedNodeId;
  const isSelectedNext = nextCandidates.includes(selectedNodeId);
  const progressInfo = selectedNodeData.calcProgress(state);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="flex flex-col w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white overflow-hidden animate-scaleIn">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 z-20 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-base text-amber-400 font-bold">
                  にゃんこ進化系統ツリー
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-pixel">
                  全{totalCount}種
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>図鑑進捗: <strong className="text-amber-300 font-pixel">{unlockedCount}</strong> / {totalCount} ({collectionPercent}%)</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">現在の姿: {CAT_SPECIES[state.catId]?.name}</span>
              </div>
            </div>
          </div>

          {/* Filter Segmented Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-800 rounded-xl text-xs font-pixel">
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setFilterMode('all');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterMode === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                すべて表示
              </button>
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setFilterMode('my_path');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterMode === 'my_path'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ★ 次の進化ルートのみ
              </button>
            </div>

            <button
              onClick={() => {
                soundManager.playCancel();
                onClose();
              }}
              className="text-xs font-pixel text-slate-400 hover:text-white px-3 py-2 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 transition-colors"
            >
              とじる
            </button>
          </div>
        </div>

        {/* Main Body: Evolution Tree Canvas Area & Inspector Drawer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Tree Scrollable Viewport */}
          <div
            ref={containerRef}
            onScroll={updatePositions}
            className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 relative select-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* SVG Connecting Lines Layer */}
            <svg
              className="absolute inset-0 pointer-events-none z-0 min-w-[1100px] min-h-[700px]"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                {/* Glowing Filter for Next Candidate Path */}
                <filter id="glow-next" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="gradient-next" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              {TREE_EDGES.map((edge, idx) => {
                const startPos = nodePositions[edge.from];
                const endPos = nodePositions[edge.to];
                if (!startPos || !endPos) return null;

                // Check edge statuses
                const isFromCurrent = edge.from === state.catId;
                const isNextCandidate = isFromCurrent && nextCandidates.includes(edge.to);
                const isHistorical = state.evolutionHistory.includes(edge.from) && state.evolutionHistory.includes(edge.to);
                const isUnlocked = state.unlockedZukan.includes(edge.from) && state.unlockedZukan.includes(edge.to);

                // If filterMode === 'my_path', dim unrelated lines
                if (filterMode === 'my_path' && !isNextCandidate && !isHistorical && edge.from !== state.catId) {
                  return null;
                }

                // Smooth Cubic Bezier S-Curve between nodes
                const dx = endPos.x - startPos.x;
                const cp1x = startPos.x + dx * 0.45;
                const cp1y = startPos.y;
                const cp2x = startPos.x + dx * 0.55;
                const cp2y = endPos.y;
                const pathD = `M ${startPos.x} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPos.x} ${endPos.y}`;

                if (isNextCandidate) {
                  // Active Next Evolution Beam: Pulsing glowing animated line!
                  return (
                    <g key={`edge-${idx}`}>
                      {/* Glow halo */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="7"
                        opacity="0.35"
                        filter="url(#glow-next)"
                      />
                      {/* Animated dashed line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="url(#gradient-next)"
                        strokeWidth="3.5"
                        strokeDasharray="8 6"
                        className="animate-pulse"
                      />
                    </g>
                  );
                }

                if (isHistorical) {
                  // Already traversed path
                  return (
                    <path
                      key={`edge-${idx}`}
                      d={pathD}
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="2.5"
                      opacity="0.8"
                    />
                  );
                }

                // Default connecting line
                return (
                  <path
                    key={`edge-${idx}`}
                    d={pathD}
                    fill="none"
                    stroke={isUnlocked ? '#64748B' : '#334155'}
                    strokeWidth={isUnlocked ? '2' : '1.5'}
                    strokeDasharray={edge.isSecret ? '4 4' : undefined}
                    opacity={isUnlocked ? 0.6 : 0.3}
                  />
                );
              })}
            </svg>

            {/* Tree Columns & Node Cards Layer */}
            <div className="relative z-10 flex gap-12 sm:gap-16 min-w-[1100px] pb-10">
              {STAGES.map((stage, colIdx) => {
                const nodesInCol = TREE_NODES.filter((n) => n.column === colIdx);

                return (
                  <div key={stage.id} className="flex-1 flex flex-col">
                    {/* Stage Column Header */}
                    <div className="mb-4 pb-2 border-b border-slate-800 text-center sticky top-0 bg-slate-900/90 backdrop-blur-xs z-10">
                      <div className="font-pixel text-xs text-amber-400 font-bold">{stage.label}</div>
                      <div className="text-[10px] text-slate-400">{stage.desc}</div>
                    </div>

                    {/* Nodes in this column */}
                    <div className="flex flex-col gap-5 justify-around flex-1">
                      {nodesInCol.map((node) => {
                        const isUnlocked = state.unlockedZukan.includes(node.id);
                        const isCurrent = state.catId === node.id;
                        const isNext = nextCandidates.includes(node.id);
                        const isSelected = selectedNodeId === node.id;
                        const species = CAT_SPECIES[node.id];
                        const progress = node.calcProgress(state);

                        // If my_path filter is on, fade out non-relevant nodes
                        const isFaded =
                          filterMode === 'my_path' && !isCurrent && !isNext && !state.evolutionHistory.includes(node.id);

                        return (
                          <div
                            key={node.id}
                            id={`tree-node-${node.id}`}
                            onClick={() => {
                              soundManager.playSelect();
                              setSelectedNodeId(node.id);
                            }}
                            className={`relative flex flex-col p-3 rounded-2xl cursor-pointer transition-all duration-200 border text-left ${
                              isFaded ? 'opacity-25 pointer-events-none' : ''
                            } ${
                              isSelected
                                ? 'ring-2 ring-amber-400 scale-[1.03] shadow-lg z-20'
                                : 'hover:scale-[1.02] z-10'
                            } ${
                              isCurrent
                                ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                                : isNext
                                ? 'bg-gradient-to-b from-emerald-500/20 to-slate-900 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : isUnlocked
                                ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                                : 'bg-slate-950/70 border-slate-800/90 opacity-75 hover:opacity-90'
                            }`}
                            style={{ minWidth: '170px', maxWidth: '200px' }}
                          >
                            {/* Current Cat Beacon Badge */}
                            {isCurrent && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-pixel text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-md animate-bounce whitespace-nowrap z-20">
                                ★ いまの姿 (YOU)
                              </div>
                            )}

                            {/* Next Candidate Badge */}
                            {isNext && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-pixel text-[10px] bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap z-20 flex items-center gap-1">
                                <span>▶</span> 次の進化候補
                              </div>
                            )}

                            {/* Node Card Header */}
                            <div className="flex items-center gap-2 mb-2">
                              {/* Sprite / AI Image / Silhouette Icon */}
                              <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                                {isUnlocked ? (
                                  species.aiImageUrl ? (
                                    <img
                                      src={species.aiImageUrl}
                                      alt={species.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <CatSprite catId={node.id} action="idle" className="scale-[0.65]" />
                                  )
                                ) : (
                                  <span className="text-xl text-slate-600 font-pixel">？</span>
                                )}
                              </div>

                              <div className="overflow-hidden">
                                <div className="text-[10px] text-amber-400/90 font-pixel truncate">
                                  {node.conditionTag}
                                </div>
                                <div className="font-bold text-xs text-white truncate">
                                  {isUnlocked ? species.name : '？？？'}
                                </div>
                                <div className="text-[9px] text-slate-400">
                                  {isUnlocked ? '✓ 発見済' : '未発見'}
                                </div>
                              </div>
                            </div>

                            {/* Condition & Real-time Progress Bar */}
                            <div className="mt-1 pt-1.5 border-t border-slate-800 text-[10px] space-y-1">
                              <div className="text-slate-300 truncate font-pixel" title={node.conditionShort}>
                                {node.conditionShort}
                              </div>

                              {/* Progress bar if reachable as next candidate */}
                              {isNext && (
                                <div className="space-y-0.5">
                                  <div className="flex justify-between text-[9px] font-pixel">
                                    <span className="text-emerald-400">
                                      {progress.met ? '達成済！' : '条件進捗'}
                                    </span>
                                    <span className="text-emerald-300 font-bold">
                                      {progress.progressPercent}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all ${
                                        progress.met ? 'bg-emerald-400' : 'bg-amber-400'
                                      }`}
                                      style={{ width: `${progress.progressPercent}%` }}
                                    />
                                  </div>
                                  <div className="text-[9px] text-slate-400 truncate">
                                    現在: {progress.currentDisplay}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inspector Drawer (Node Details & Evolution Guide) */}
          <div className="w-full lg:w-80 bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto z-20">
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-pixel text-amber-400">
                  {selectedNodeData.stageLabel} · 詳細情報
                </span>
                {isSelectedCurrent && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-pixel px-2 py-0.5 rounded border border-amber-500/40">
                    現在の姿
                  </span>
                )}
                {isSelectedNext && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-pixel px-2 py-0.5 rounded border border-emerald-500/40">
                    直近の進化候補
                  </span>
                )}
              </div>

              {/* Graphic Mode Toggle if image exists */}
              {isSelectedUnlocked && selectedSpecies.aiImageUrl && (
                <div className="flex items-center justify-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-pixel">
                  <button
                    onClick={() => setViewGraphicMode('3d')}
                    className={`flex-1 py-1 px-2 rounded-lg transition-all ${
                      viewGraphicMode === '3d'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ✨ AI 3Dフィギュア
                  </button>
                  <button
                    onClick={() => setViewGraphicMode('pixel')}
                    className={`flex-1 py-1 px-2 rounded-lg transition-all ${
                      viewGraphicMode === 'pixel'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    👾 2D レトロドット
                  </button>
                </div>
              )}

              {/* Big Sprite / 3D Figure Showcase */}
              <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden">
                {isSelectedUnlocked ? (
                  <>
                    {viewGraphicMode === '3d' && selectedSpecies.aiImageUrl ? (
                      <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl group">
                        <img
                          src={selectedSpecies.aiImageUrl}
                          alt={selectedSpecies.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-1.5 right-2 text-[9px] font-pixel bg-slate-950/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                          AI 3D ART
                        </span>
                      </div>
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center">
                        <CatSprite catId={selectedSpecies.id} action="idle" className="scale-105" />
                      </div>
                    )}
                    <div className="text-xs font-pixel text-amber-400 mt-2.5">{selectedSpecies.title}</div>
                    <div className="font-bold text-base text-white">{selectedSpecies.name}</div>
                  </>
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <span className="text-4xl text-slate-700 mb-2">🐾</span>
                    <span className="font-pixel text-xs text-slate-500">？？？（未発見）</span>
                    <span className="text-[10px] text-slate-600 mt-1">条件を満たして進化させると解放</span>
                  </div>
                )}
              </div>

              {/* Backstory & Personality (if unlocked) */}
              {isSelectedUnlocked ? (
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <p className="mb-2">{selectedSpecies.description}</p>
                  <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800 pt-2">
                    <div><span className="text-slate-500">性格:</span> {selectedSpecies.personality}</div>
                    <div><span className="text-slate-500">好物:</span> {selectedSpecies.favoriteFood}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs text-amber-200/90 leading-relaxed">
                  <span className="font-bold text-amber-400">🔍 解放ヒント:</span><br />
                  {selectedSpecies.unlockedHint}
                </div>
              )}

              {/* Evolution Requirements & Progress Box */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-pixel text-amber-300">
                  【 進化条件 & 到達進捗 】
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">
                  {progressInfo.description}
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-800/60 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>達成目標:</span>
                    <span className="text-slate-200 font-pixel">{progressInfo.targetDisplay}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>現在の記録:</span>
                    <span className="text-amber-300 font-pixel">{progressInfo.currentDisplay}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-pixel">
                    <span className="text-slate-400">条件達成率</span>
                    <span className={progressInfo.met ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {progressInfo.progressPercent}% {progressInfo.met && '✓ 達成!'}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all ${
                        progressInfo.met ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressInfo.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action / Quick Navigation */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  soundManager.playConfirm();
                  onClose();
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-pixel text-xs rounded-xl border border-slate-700 transition-colors"
              >
                お世話画面に戻る
              </button>
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-pixel gap-2 z-10">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>いまの姿</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>次に進化可能な候補</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-400 inline-block" />
              <span>活性中の進化ルート線</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-cyan-400 inline-block" />
              <span>過去の経由ルート</span>
            </span>
          </div>

          <div className="text-slate-500">
            ※ カードをクリックすると、進化の詳しい条件と達成進捗を確認できます。
          </div>
        </div>
      </div>
    </div>
  );
};
