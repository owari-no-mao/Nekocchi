import React from 'react';
import { ShellColorId, LcdBacklightId } from '../types/game';
import { soundManager } from '../utils/audio';

interface ShopModalProps {
  coins: number;
  ownedItems: string[];
  activeShell: ShellColorId;
  activeBacklight: LcdBacklightId;
  onBuyItem: (itemId: string, cost: number) => void;
  onSetShell: (shell: ShellColorId) => void;
  onSetBacklight: (light: LcdBacklightId) => void;
  onClose: () => void;
}

export const SHELL_COLORS: Array<{ id: ShellColorId; name: string; colorHex: string; price: number }> = [
  { id: 'classic_pink', name: 'いちごミルク (ピンク)', colorHex: '#F472B6', price: 0 },
  { id: 'mint_green', name: 'メロンソーダ (ミント)', colorHex: '#34D399', price: 40 },
  { id: 'creamy_butter', name: 'カスタード (クリーム)', colorHex: '#FBBF24', price: 40 },
  { id: 'cyber_lilac', name: 'サイバーラベンダー (紫)', colorHex: '#A78BFA', price: 60 },
  { id: 'retro_yellow', name: 'レトロたまご (イエロー)', colorHex: '#FCD34D', price: 60 },
];

export const LCD_BACKLIGHTS: Array<{ id: LcdBacklightId; name: string; previewHex: string }> = [
  { id: 'matrix_green', name: '元祖グリーン (ドット)', previewHex: '#84CC16' },
  { id: 'warm_amber', name: '夕暮れアンバー (琥珀)', previewHex: '#F59E0B' },
  { id: 'cyber_blue', name: 'ネオンブルー (夜間光)', previewHex: '#06B6D4' },
  { id: 'classic_grey', name: 'モノクログレー (初期)', previewHex: '#94A3B8' },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  ownedItems,
  activeShell,
  activeBacklight,
  onBuyItem,
  onSetShell,
  onSetBacklight,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<'shell' | 'backlight'>('shell');

  return (
    <div className="flex flex-col w-full max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 animate-fadeIn max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛍️</span>
          <div>
            <span className="font-pixel text-sm text-amber-400">にゃんこカスタマイズ</span>
            <div className="text-[10px] text-slate-400">
              所持コイン: <strong className="text-amber-300 font-pixel">{coins}</strong> 🪙
            </div>
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

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800/80 rounded-xl mb-3">
        <button
          onClick={() => setActiveTab('shell')}
          className={`flex-1 py-1.5 text-xs font-pixel rounded-lg transition-colors ${
            activeTab === 'shell' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          たまごシェルカラー
        </button>
        <button
          onClick={() => setActiveTab('backlight')}
          className={`flex-1 py-1.5 text-xs font-pixel rounded-lg transition-colors ${
            activeTab === 'backlight' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          LCD液晶バックライト
        </button>
      </div>

      {/* Shell Selection Tab */}
      {activeTab === 'shell' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 mb-1">
            たまごっち型ハードウェアの外装カラーを着せ替えられます。
          </p>
          {SHELL_COLORS.map((item) => {
            const isOwned = item.price === 0 || ownedItems.includes(`shell_${item.id}`);
            const isActive = activeShell === item.id;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full border-2 border-white/50 shadow-inner"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <div>
                    <div className="text-xs font-pixel text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {isOwned ? (isActive ? '装着中' : '所持済み') : `${item.price} コイン`}
                    </div>
                  </div>
                </div>

                {isOwned ? (
                  <button
                    onClick={() => {
                      soundManager.playConfirm();
                      onSetShell(item.id);
                    }}
                    disabled={isActive}
                    className={`text-xs font-pixel px-3 py-1 rounded-lg ${
                      isActive
                        ? 'bg-amber-500/30 text-amber-300 cursor-default'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {isActive ? '使用中' : 'きせかえ'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (coins >= item.price) {
                        soundManager.playConfirm();
                        onBuyItem(`shell_${item.id}`, item.price);
                        onSetShell(item.id);
                      } else {
                        soundManager.playCancel();
                      }
                    }}
                    disabled={coins < item.price}
                    className={`text-xs font-pixel px-3 py-1 rounded-lg ${
                      coins >= item.price
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    購入 ({item.price}🪙)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Backlight Selection Tab */}
      {activeTab === 'backlight' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 mb-1">
            LCD液晶画面の発光色（バックライト）を変更できます。
          </p>
          {LCD_BACKLIGHTS.map((item) => {
            const isActive = activeBacklight === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playConfirm();
                  onSetBacklight(item.id);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/50'
                    : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-md border border-slate-700 shadow-inner"
                    style={{ backgroundColor: item.previewHex }}
                  />
                  <div>
                    <div className="text-xs font-pixel text-slate-200">{item.name}</div>
                  </div>
                </div>

                <span className={`text-xs font-pixel ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                  {isActive ? '点灯中' : '選択'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
