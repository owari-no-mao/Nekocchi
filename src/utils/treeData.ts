import { CatEvolutionId, CatStage, CAT_SPECIES } from '../types/cat';
import { PetGameState } from '../types/game';

export interface TreeEdge {
  from: CatEvolutionId;
  to: CatEvolutionId;
  label: string;
  isSecret?: boolean;
}

export interface TreeNodeData {
  id: CatEvolutionId;
  stage: CatStage;
  stageLabel: string;
  column: number; // 0=Egg, 1=Baby, 2=Child, 3=Adult, 4=Legendary
  row: number;
  conditionShort: string;
  conditionTag: string;
  calcProgress: (state: PetGameState) => {
    progressPercent: number;
    met: boolean;
    currentDisplay: string;
    targetDisplay: string;
    description: string;
  };
}

export const TREE_EDGES: TreeEdge[] = [
  // Egg -> Baby
  { from: 'cat_egg', to: 'baby_fluff', label: '温めて孵化' },

  // Baby -> Child
  { from: 'baby_fluff', to: 'child_playful', label: '運動・ミニゲーム多め' },
  { from: 'baby_fluff', to: 'child_glutton', label: 'ごはん・おやつたっぷり' },
  { from: 'baby_fluff', to: 'child_calm', label: 'ブラッシング＆丁寧なお世話' },

  // Child -> Adult standard
  { from: 'child_playful', to: 'adult_mike', label: 'ミニゲーム特化' },
  { from: 'child_playful', to: 'adult_siamese', label: 'スキンシップ' },
  { from: 'child_playful', to: 'adult_hachiware', label: 'バランス育成' },

  { from: 'child_glutton', to: 'adult_chatora', label: '体重4.2kg以上' },
  { from: 'child_glutton', to: 'adult_shiro', label: '高級おやつ＆清潔' },
  { from: 'child_glutton', to: 'adult_hachiware', label: 'バランス育成' },

  { from: 'child_calm', to: 'adult_kuro', label: 'しつけ70%以上＆ミス極小' },
  { from: 'child_calm', to: 'adult_hachiware', label: 'バランス育成' },

  // Secret Adults (Accessible from any child)
  { from: 'child_playful', to: 'adult_manekineko', label: 'ミス0＆徳のコイン', isSecret: true },
  { from: 'child_glutton', to: 'adult_manekineko', label: 'ミス0＆徳のコイン', isSecret: true },
  { from: 'child_calm', to: 'adult_manekineko', label: 'ミス0＆徳のコイン', isSecret: true },

  { from: 'child_playful', to: 'adult_sorcerer', label: '夜間ケア＆知性MAX', isSecret: true },
  { from: 'child_calm', to: 'adult_sorcerer', label: '夜間ケア＆知性MAX', isSecret: true },

  // Adult -> Legendary
  { from: 'adult_mike', to: 'legend_royalty', label: '長寿＆高い愛情' },
  { from: 'adult_chatora', to: 'legend_royalty', label: '長寿＆高い愛情' },
  { from: 'adult_kuro', to: 'legend_royalty', label: '長寿＆高い愛情' },
  { from: 'adult_hachiware', to: 'legend_royalty', label: '長寿＆高い愛情' },
  { from: 'adult_shiro', to: 'legend_royalty', label: '長寿＆高い愛情' },
  { from: 'adult_siamese', to: 'legend_royalty', label: '長寿＆高い愛情' },

  // Secret Adults -> Celestial
  { from: 'adult_manekineko', to: 'legend_celestial', label: '奇跡の神化', isSecret: true },
  { from: 'adult_sorcerer', to: 'legend_celestial', label: '奇跡の神化', isSecret: true },
];

export const TREE_NODES: TreeNodeData[] = [
  // Column 0: Egg
  {
    id: 'cat_egg',
    stage: 'egg',
    stageLabel: 'たまご期',
    column: 0,
    row: 0,
    conditionShort: '初期状態',
    conditionTag: 'スタート',
    calcProgress: (state) => ({
      progressPercent: 100,
      met: true,
      currentDisplay: '100%',
      targetDisplay: '完了',
      description: 'すべての命の始まり。',
    }),
  },

  // Column 1: Baby
  {
    id: 'baby_fluff',
    stage: 'baby',
    stageLabel: 'あかちゃん期',
    column: 1,
    row: 0,
    conditionShort: 'たまごタップ5回で誕生',
    conditionTag: '孵化',
    calcProgress: (state) => {
      const taps = state.eggTaps;
      const met = state.hatched || taps >= 5;
      return {
        progressPercent: met ? 100 : Math.min(100, (taps / 5) * 100),
        met,
        currentDisplay: `${taps}回`,
        targetDisplay: '5回タップ',
        description: 'たまごを優しく温めると孵化します。',
      };
    },
  },

  // Column 2: Child (3 branches)
  {
    id: 'child_playful',
    stage: 'child',
    stageLabel: 'こども期（活発）',
    column: 2,
    row: 0,
    conditionShort: 'ミニゲーム2勝以上',
    conditionTag: '運動派',
    calcProgress: (state) => {
      const wins = state.lifetimeMiniGamesWon;
      const met = wins >= 2;
      return {
        progressPercent: met ? 100 : Math.min(100, Math.round((wins / 2) * 100)),
        met,
        currentDisplay: `${wins}勝`,
        targetDisplay: '2勝',
        description: 'ミニゲームを積極的にプレイして勝利すると進化します。',
      };
    },
  },
  {
    id: 'child_glutton',
    stage: 'child',
    stageLabel: 'こども期（大食漢）',
    column: 2,
    row: 1,
    conditionShort: '体重1.6kg以上 または おやつ3回',
    conditionTag: '食欲派',
    calcProgress: (state) => {
      const weightP = (state.weight / 1.6) * 100;
      const snacksP = (state.lifetimeSnacksGiven / 3) * 100;
      const maxP = Math.min(100, Math.round(Math.max(weightP, snacksP)));
      const met = state.weight >= 1.6 || state.lifetimeSnacksGiven >= 3;
      return {
        progressPercent: met ? 100 : maxP,
        met,
        currentDisplay: `${state.weight.toFixed(1)}kg / おやつ${state.lifetimeSnacksGiven}回`,
        targetDisplay: '1.6kg or おやつ3回',
        description: 'ごはんやおやつをたくさん食べてすくすく育ちます。',
      };
    },
  },
  {
    id: 'child_calm',
    stage: 'child',
    stageLabel: 'こども期（穏やか）',
    column: 2,
    row: 2,
    conditionShort: '丁寧なお世話（清潔＆ブラッシング）',
    conditionTag: '知性派',
    calcProgress: (state) => {
      const score = state.lifetimeBrushCount * 25 + state.cleanliness;
      const met = state.lifetimeBrushCount >= 2 && state.cleanliness >= 70;
      const p = Math.min(100, Math.round((score / 150) * 100));
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `ブラッシング${state.lifetimeBrushCount}回 · 清潔${state.cleanliness}%`,
        targetDisplay: 'ブラシ2回＆清潔70%+',
        description: 'ブラッシングと清潔なお部屋で落ち着いた子に育ちます。',
      };
    },
  },

  // Column 3: Adult (8 branches)
  {
    id: 'adult_mike',
    stage: 'adult',
    stageLabel: '成猫期（アスリート）',
    column: 3,
    row: 0,
    conditionShort: 'ミニゲーム5勝以上 または 得点120+',
    conditionTag: '運動マスター',
    calcProgress: (state) => {
      const p1 = (state.lifetimeMiniGamesWon / 5) * 100;
      const p2 = (state.lifetimeMiniGamesScore / 120) * 100;
      const p = Math.min(100, Math.round(Math.max(p1, p2)));
      const met = state.lifetimeMiniGamesWon >= 5 || state.lifetimeMiniGamesScore >= 120;
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `${state.lifetimeMiniGamesWon}勝 / 得点${state.lifetimeMiniGamesScore}`,
        targetDisplay: '5勝 or 120点',
        description: '圧倒的な跳躍力と瞬発力を誇るアスリート猫。',
      };
    },
  },
  {
    id: 'adult_chatora',
    stage: 'adult',
    stageLabel: '成猫期（ぽっちゃり）',
    column: 3,
    row: 1,
    conditionShort: '体重4.2kg以上＆おやつ5回以上',
    conditionTag: '巨大モフモフ',
    calcProgress: (state) => {
      const p = Math.min(100, Math.round((state.weight / 4.2) * 100));
      const met = state.weight >= 4.2 || state.lifetimeSnacksGiven >= 5;
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `${state.weight.toFixed(1)}kg (おやつ${state.lifetimeSnacksGiven}回)`,
        targetDisplay: '4.2kg以上',
        description: '香箱座りすると巨大な食パンになる癒やしの巨漢。',
      };
    },
  },
  {
    id: 'adult_kuro',
    stage: 'adult',
    stageLabel: '成猫期（知性派）',
    column: 3,
    row: 2,
    conditionShort: 'しつけ70%以上＆お世話ミス1回以下',
    conditionTag: '賢哲メガネ',
    calcProgress: (state) => {
      const pDisc = (state.discipline / 70) * 100;
      const met = state.discipline >= 70 && state.careMistakes <= 1;
      const p = Math.min(100, Math.round(pDisc));
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `しつけ${state.discipline}% / ミス${state.careMistakes}回`,
        targetDisplay: 'しつけ70%+＆ミス≤1',
        description: 'メガネをかけた知的で礼儀正しい黒猫。',
      };
    },
  },
  {
    id: 'adult_shiro',
    stage: 'adult',
    stageLabel: '成猫期（高貴）',
    column: 3,
    row: 3,
    conditionShort: '清潔80%以上＆ブラシ6回以上',
    conditionTag: '姫君ティアラ',
    calcProgress: (state) => {
      const p1 = (state.cleanliness / 80) * 100;
      const p2 = (state.lifetimeBrushCount / 6) * 100;
      const p = Math.min(100, Math.round((p1 + p2) / 2));
      const met = state.cleanliness >= 80 && state.lifetimeBrushCount >= 6;
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `清潔${state.cleanliness}% / ブラシ${state.lifetimeBrushCount}回`,
        targetDisplay: '清潔80%+＆ブラシ6回',
        description: '真っ白なシルクの毛並みとティアラを戴く美猫。',
      };
    },
  },
  {
    id: 'adult_hachiware',
    stage: 'adult',
    stageLabel: '成猫期（癒やし）',
    column: 3,
    row: 4,
    conditionShort: 'ごはん・運動・清潔のバランス育成',
    conditionTag: '福の鑑',
    calcProgress: (state) => {
      const avg = Math.round((state.hunger + state.happiness + state.cleanliness) / 3);
      const met = avg >= 60;
      return {
        progressPercent: Math.min(100, avg),
        met,
        currentDisplay: `平均充足度: ${avg}%`,
        targetDisplay: 'バランス良くお世話',
        description: 'おでこの八文字が福を呼ぶ、誰からも愛される優しい猫。',
      };
    },
  },
  {
    id: 'adult_siamese',
    stage: 'adult',
    stageLabel: '成猫期（優美）',
    column: 3,
    row: 5,
    conditionShort: 'ブラッシング4回＆ごきげん75%以上',
    conditionTag: 'ダンサー',
    calcProgress: (state) => {
      const p1 = (state.lifetimeBrushCount / 4) * 100;
      const p2 = (state.happiness / 75) * 100;
      const p = Math.min(100, Math.round((p1 + p2) / 2));
      const met = state.lifetimeBrushCount >= 4 && state.happiness >= 75;
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `ブラシ${state.lifetimeBrushCount}回 · ごきげん${state.happiness}%`,
        targetDisplay: 'ブラシ4回＆ごきげん75%+',
        description: 'しなやかなステップでおしゃべり大好きな貴公子。',
      };
    },
  },
  {
    id: 'adult_manekineko',
    stage: 'adult',
    stageLabel: '成猫期（シークレット）',
    column: 3,
    row: 6,
    conditionShort: '【秘術】ミス0回 ＆ コイン60枚 ＆ しつけ75%',
    conditionTag: '★ 幸運招き',
    calcProgress: (state) => {
      const pCoin = (state.coins / 60) * 100;
      const pDisc = (state.discipline / 75) * 100;
      const penalty = state.careMistakes > 0 ? 0 : 1;
      const p = Math.min(100, Math.round(((pCoin + pDisc) / 2) * penalty));
      const met = state.careMistakes === 0 && state.coins >= 60 && state.discipline >= 75;
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `ミス${state.careMistakes}回 · コイン${state.coins}🪙 · しつけ${state.discipline}%`,
        targetDisplay: 'ミス0＆60コイン＆しつけ75%',
        description: '金運と千客万来をもたらす伝説の小判持ち招き猫。',
      };
    },
  },
  {
    id: 'adult_sorcerer',
    stage: 'adult',
    stageLabel: '成猫期（シークレット）',
    column: 3,
    row: 7,
    conditionShort: '【秘術】夜間（21〜4時）＆ 知性75% ＆ ごきげん80%',
    conditionTag: '★ 星詠み魔法',
    calcProgress: (state) => {
      const isNight = state.inGameHour >= 21 || state.inGameHour <= 4;
      const pInt = (state.intelligence / 75) * 100;
      const pHap = (state.happiness / 80) * 100;
      const met = isNight && state.intelligence >= 75 && state.happiness >= 80;
      const p = Math.min(100, Math.round((pInt + pHap) / 2));
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `夜間:${isNight ? '◯' : '✕'} · 知性${state.intelligence}% · ごきげん${state.happiness}%`,
        targetDisplay: '夜間＆知性75%+＆ごきげん80%+',
        description: '星空の夜にお世話された奇跡の魔法使い猫。',
      };
    },
  },

  // Column 4: Legendary (2 branches)
  {
    id: 'legend_royalty',
    stage: 'legendary',
    stageLabel: '伝説神猫（王者）',
    column: 4,
    row: 0,
    conditionShort: '成猫で7日以上大切に育成（全ステータス高水準）',
    conditionTag: '👑 キング百獣',
    calcProgress: (state) => {
      const pAge = (state.ageDays / 7) * 100;
      const met = state.ageDays >= 7;
      const p = Math.min(100, Math.round(pAge));
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: `経過日数: ${state.ageDays} / 7日`,
        targetDisplay: '7日以上生存',
        description: '黄金の王冠と威厳あるたてがみを戴く百獣の覇王。',
      };
    },
  },
  {
    id: 'legend_celestial',
    stage: 'legendary',
    stageLabel: '伝説神猫（天界）',
    column: 4,
    row: 1,
    conditionShort: 'シークレット猫から覚醒進化',
    conditionTag: '✨ 天の翼',
    calcProgress: (state) => {
      const isSecretCat = state.catId === 'adult_manekineko' || state.catId === 'adult_sorcerer';
      const met = isSecretCat && (state.ageDays >= 5 || state.streakDays >= 3);
      const p = isSecretCat ? Math.min(100, Math.round((state.streakDays / 3) * 100)) : 0;
      return {
        progressPercent: met ? 100 : p,
        met,
        currentDisplay: isSecretCat ? `ストリーク: ${state.streakDays}/3日` : 'シークレット猫が必要',
        targetDisplay: '招き猫/魔法猫から覚醒',
        description: '背中に神秘の光の翼を持つ、至高の天界守護神猫。',
      };
    },
  },
];

/**
 * Returns all direct next evolution candidate IDs for the current cat
 */
export function getNextEvolutionCandidates(currentCatId: CatEvolutionId): CatEvolutionId[] {
  return TREE_EDGES.filter((edge) => edge.from === currentCatId).map((edge) => edge.to);
}
