import { CatEvolutionId, CatStage } from './cat';

export interface DailyCareTask {
  id: string;
  label: string;
  category: 'meal' | 'toilet' | 'brush' | 'game' | 'snack' | 'discipline' | 'sleep';
  rewardCoins: number;
  completed: boolean;
}

export interface CareHistoryEntry {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  totalTasks: number;
  catSpeciesId: CatEvolutionId;
  allClear: boolean;
}

export interface CatMemoryEntry {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  inGameDay: number;
  inGameHour: number;
  category: 'evolution' | 'growth' | 'care' | 'health' | 'play' | 'user';
  title: string;
  story: string;
  catId: CatEvolutionId;
  catName: string;
  weight: number;
  sticker: string;
  photoUrl?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'food' | 'toy' | 'shell' | 'room';
  price: number;
  icon: string;
  hungerBoost?: number;
  happinessBoost?: number;
  disciplineBoost?: number;
  weightBoost?: number;
  unlocked?: boolean;
}

export type ShellColorId = 'classic_pink' | 'mint_green' | 'creamy_butter' | 'cyber_lilac' | 'retro_yellow';

export interface ShellColorConfig {
  id: ShellColorId;
  name: string;
  outerBg: string;
  innerBorder: string;
  accent: string;
  buttonBg: string;
  buttonActiveBg: string;
}

export type LcdBacklightId = 'matrix_green' | 'warm_amber' | 'cyber_blue' | 'classic_grey';

export interface LcdBacklightConfig {
  id: LcdBacklightId;
  name: string;
  bgClass: string;
  textClass: string;
  matrixDotClass: string;
  screenGlow: string;
}

export interface PetGameState {
  // Identity & Stage
  catId: CatEvolutionId;
  catName: string;
  stage: CatStage;
  generation: number;
  hatched: boolean;
  eggTaps: number;

  // Real-time & Virtual Time stats
  createdAt: number;
  lastFedAt: number;
  lastCleanedAt: number;
  lastInteractionAt: number;
  lastSaveTimestamp: number;
  ageDays: number;
  inGameHour: number; // 0-23
  inGameDay: number;

  // Primary Vitals (0 - 100)
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  discipline: number;
  intelligence: number;
  weight: number; // in kg

  // Status flags
  isSleeping: boolean;
  lightsOff: boolean;
  isSick: boolean;
  sicknessType: string | null;
  isNaughty: boolean;
  naughtyType: 'scratching' | 'knocking_cup' | 'midnight_zoomies' | null;
  poopCount: number;

  // Lifetime care tracking for evolution logic
  lifetimeSnacksGiven: number;
  lifetimeMealsGiven: number;
  lifetimeMiniGamesWon: number;
  lifetimeMiniGamesScore: number;
  lifetimeBrushCount: number;
  careMistakes: number;
  evolutionHistory: CatEvolutionId[];
  unlockedZukan: CatEvolutionId[];

  // Economy & Inventory
  coins: number;
  ownedItems: string[];
  activeShell: ShellColorId;
  activeBacklight: LcdBacklightId;

  // Daily Routine & Quests
  currentDateStr: string;
  streakDays: number;
  dailyTasks: DailyCareTask[];
  careHistory: CareHistoryEntry[];
  memories: CatMemoryEntry[];

  // Sound settings
  soundEnabled: boolean;
}

export type ActiveModal =
  | null
  | 'menu_food'
  | 'menu_clean'
  | 'menu_play'
  | 'menu_discipline'
  | 'menu_medicine'
  | 'menu_status'
  | 'zukan'
  | 'evolution_tree'
  | 'daily_care'
  | 'shop'
  | 'time_machine'
  | 'settings'
  | 'evolution_ceremony';
