import React, { useState } from 'react';
import { CatEvolutionId, CAT_SPECIES, CatSpeciesInfo } from '../types/cat';
import { CatSprite } from './CatSprite';
import { soundManager } from '../utils/audio';

interface ZukanModalProps {
  unlockedList: CatEvolutionId[];
  onClose: () => void;
  onOpenEvolutionTree?: () => void;
}

export const ZukanModal: React.FC<ZukanModalProps> = ({ unlockedList, onClose, onOpenEvolutionTree }) => {
  const [selectedCatId, setSelectedCatId] = useState<CatEvolutionId>(unlockedList[0] || 'cat_egg');
  const [viewTab, setViewTab] = useState<'grid' | 'tree'>('grid');

  const speciesArray = Object.values(CAT_SPECIES);
  const selectedSpecies: CatSpeciesInfo = CAT_SPECIES[selectedCatId] || CAT_SPECIES.cat_egg;
  const isSelectedUnlocked = unlockedList.includes(selectedCatId);

  const unlockedCount = unlockedList.length;
  const totalCount = speciesArray.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="flex flex-col w-full max-w-lg bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-fadeIn max-h-[85vh] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📖</span>
          <div>
            <span className="font-pixel text-sm text-amber-400">にゃんこ進化図鑑</span>
            <div className="text-[10px] text-slate-400">
              コンプリート率: <strong className="text-amber-300 font-pixel">{unlockedCount}</strong> / {totalCount}種 ({progressPercent}%)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenEvolutionTree && (
            <button
              onClick={() => {
                soundManager.playConfirm();
                onOpenEvolutionTree();
              }}
              className="text-xs text-emerald-300 hover:text-white px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 rounded-lg border border-emerald-500/40 transition-colors flex items-center gap-1 font-pixel"
            >
              <span>🌿</span> 系統ツリー
            </button>
          )}
          <button
            onClick={() => {
              soundManager.playSelect();
              setViewTab(viewTab === 'grid' ? 'tree' : 'grid');
            }}
            className="text-xs text-amber-300 hover:text-white px-2 py-1 bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            {viewTab === 'grid' ? 'テキスト系統' : '図鑑グリッド'}
          </button>
          <button
            onClick={() => {
              soundManager.playCancel();
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded transition-colors"
          >
            とじる
          </button>
        </div>
      </div>

      {viewTab === 'grid' ? (
        <div className="flex flex-col md:flex-row gap-3 overflow-hidden flex-1">
          {/* Species Grid List */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-y-auto max-h-56 md:max-h-80 p-1 flex-1">
            {speciesArray.map((sp) => {
              const unlocked = unlockedList.includes(sp.id);
              const isSelected = selectedCatId === sp.id;

              return (
                <button
                  key={sp.id}
                  onClick={() => {
                    soundManager.playSelect();
                    setSelectedCatId(sp.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400/50'
                      : unlocked
                      ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-750'
                      : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center relative rounded-lg overflow-hidden">
                    {unlocked ? (
                      sp.aiImageUrl ? (
                        <img
                          src={sp.aiImageUrl}
                          alt={sp.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <CatSprite catId={sp.id} action="idle" className="scale-[0.55] -my-3" />
                      )
                    ) : (
                      <span className="text-xl text-slate-600 font-pixel">？</span>
                    )}
                  </div>
                  <span className="text-[10px] truncate max-w-full text-center mt-1 text-slate-300 font-pixel">
                    {unlocked ? sp.name : '？？？'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Species Detail Panel */}
          <div className="w-full md:w-64 bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-col justify-between overflow-y-auto">
            {isSelectedUnlocked ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 p-2 mb-2 relative overflow-hidden shadow-inner">
                  {selectedSpecies.aiImageUrl ? (
                    <img
                      src={selectedSpecies.aiImageUrl}
                      alt={selectedSpecies.name}
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <CatSprite catId={selectedSpecies.id} action="idle" className="scale-95" />
                  )}
                </div>
                <div className="text-xs font-pixel text-amber-400 mb-0.5">{selectedSpecies.title}</div>
                <h3 className="text-sm font-bold text-white mb-2">{selectedSpecies.name}</h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-3 text-left bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  {selectedSpecies.description}
                </p>

                <div className="w-full text-left text-[11px] text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-500">せいかく:</span> {selectedSpecies.personality}
                  </div>
                  <div>
                    <span className="text-slate-500">好物:</span> {selectedSpecies.favoriteFood}
                  </div>
                  <div>
                    <span className="text-slate-500">段階:</span>{' '}
                    {selectedSpecies.stage === 'egg' && 'たまご'}
                    {selectedSpecies.stage === 'baby' && 'あかちゃん'}
                    {selectedSpecies.stage === 'child' && 'こども'}
                    {selectedSpecies.stage === 'adult' && '成猫'}
                    {selectedSpecies.stage === 'legendary' && 'でんせつ神猫'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-4">
                <div className="text-4xl text-slate-700 mb-2">🐾</div>
                <div className="font-pixel text-sm text-slate-500 mb-1">未発見のにゃんこ</div>
                <div className="text-[11px] text-slate-400 mb-3">
                  段階: {selectedSpecies.stage === 'child' ? 'こども期' : selectedSpecies.stage === 'adult' ? '成猫期' : '伝説期'}
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-left text-xs text-amber-300/90 leading-relaxed">
                  <span className="font-bold text-amber-400">🔍 発見のヒント:</span><br />
                  {selectedSpecies.unlockedHint}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Evolutionary Tree Branch Diagram
        <div className="overflow-y-auto max-h-[70vh] p-2 space-y-4 text-xs">
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700">
            <div className="font-pixel text-amber-400 mb-1">🌱 育成方針による進化の仕組み</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              猫ちゃんはあなたのお世話スタイル（ごはんの量・おやつの頻度・ミニゲーム運動量・しつけ・清潔さ）によって、全く異なる姿へ進化します！
            </p>
          </div>

          {/* Tree Diagram Visual */}
          <div className="space-y-3 font-pixel">
            {/* Step 1: Egg */}
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
              <span className="text-2xl">🥚</span>
              <div>
                <div className="text-white text-xs">たまご (Cat Egg)</div>
                <div className="text-[10px] text-slate-400">温めるとあかちゃんへ孵化</div>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-slate-700 space-y-2">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                <span className="text-2xl">🐱</span>
                <div>
                  <div className="text-sky-300 text-xs">しろこねこ (Baby)</div>
                  <div className="text-[10px] text-slate-400">純真無垢な最初のこねこ</div>
                </div>
              </div>

              {/* Step 2: Child Branches */}
              <div className="pl-6 border-l-2 border-slate-700 space-y-2">
                <div className="text-[11px] text-amber-300">▼ こども期の分岐 (3系統)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-900 rounded border border-orange-500/30">
                    <div className="text-orange-400 text-xs">やんちゃ三毛</div>
                    <div className="text-[10px] text-slate-400">ミニゲームを遊ぶ</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-amber-500/30">
                    <div className="text-amber-400 text-xs">くいしんぼ茶トラ</div>
                    <div className="text-[10px] text-slate-400">ごはん・おやつ多め</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-indigo-500/30">
                    <div className="text-indigo-300 text-xs">くろこねこ</div>
                    <div className="text-[10px] text-slate-400">ブラッシング・しつけ</div>
                  </div>
                </div>

                {/* Step 3: Adult Branches */}
                <div className="text-[11px] text-amber-300 pt-2">▼ 成猫期の分岐 (個性豊かな8種)</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-emerald-400">三毛アスリート</strong>
                    <div className="text-[10px] text-slate-400">ミニゲーム高得点＆運動</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-orange-400">ぽっちゃり茶トラ</strong>
                    <div className="text-[10px] text-slate-400">体重4.2kg以上＆食いしん坊</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-yellow-400">インテリ黒猫</strong>
                    <div className="text-[10px] text-slate-400">しつけ度高＆お世話ミス極小</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-sky-300">白猫プリンセス</strong>
                    <div className="text-[10px] text-slate-400">清潔度90%以上＆ちゅ〜る</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-amber-300">おっとりハチワレ</strong>
                    <div className="text-[10px] text-slate-400">バランスの良い毎日のお世話</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-amber-500">シャムダンサー</strong>
                    <div className="text-[10px] text-slate-400">スキンシップ＆ブラッシング</div>
                  </div>
                  <div className="p-2 bg-amber-950/40 rounded border border-amber-500/50">
                    <strong className="text-amber-300">★ 招き猫 (シークレット)</strong>
                    <div className="text-[10px] text-slate-400">ミス0＆高コイン所持</div>
                  </div>
                  <div className="p-2 bg-indigo-950/40 rounded border border-indigo-500/50">
                    <strong className="text-pink-400">★ 魔法使い (シークレット)</strong>
                    <div className="text-[10px] text-slate-400">夜間のお世話＆知性MAX</div>
                  </div>
                </div>

                {/* Step 4: Legendary */}
                <div className="text-[11px] text-amber-300 pt-2">▼ 伝説覚醒 (長寿と深い愛情)</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-amber-900/30 rounded border border-amber-400/40">
                    <strong className="text-amber-200">👑 キングライオン</strong>
                    <div className="text-[10px] text-slate-400">7日以上大切に育て上げる</div>
                  </div>
                  <div className="p-2 bg-purple-900/30 rounded border border-purple-400/40">
                    <strong className="text-purple-200">✨ 天翼ネコ</strong>
                    <div className="text-[10px] text-slate-400">シークレット猫から覚醒</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
