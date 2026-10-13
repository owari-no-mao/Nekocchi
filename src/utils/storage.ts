import { PetGameState, DailyCareTask } from '../types/game';

const STORAGE_KEY = 'nekogotchi_save_v1';

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateDailyTasks(): DailyCareTask[] {
  return [
    { id: 'task_meal', label: 'カリカリやごはんをあげる', category: 'meal', rewardCoins: 10, completed: false },
    { id: 'task_toilet', label: 'トイレのうんちをそうじする', category: 'toilet', rewardCoins: 10, completed: false },
    { id: 'task_brush', label: 'ブラッシングして毛並みを整える', category: 'brush', rewardCoins: 15, completed: false },
    { id: 'task_game', label: 'ミニゲームで楽しく遊ぶ', category: 'game', rewardCoins: 20, completed: false },
    { id: 'task_snack', label: 'ごほうびにおやつをあげる', category: 'snack', rewardCoins: 10, completed: false },
    { id: 'task_sleep', label: 'でんきを消してぐっすり眠らせる', category: 'sleep', rewardCoins: 15, completed: false },
  ];
}

export const INITIAL_STATE: PetGameState = {
  catId: 'cat_egg',
  catName: 'たまごちゃん',
  stage: 'egg',
  generation: 1,
  hatched: false,
  eggTaps: 0,

  createdAt: Date.now(),
  lastFedAt: Date.now(),
  lastCleanedAt: Date.now(),
  lastInteractionAt: Date.now(),
  lastSaveTimestamp: Date.now(),
  ageDays: 0,
  inGameHour: 10,
  inGameDay: 1,

  hunger: 80,
  happiness: 80,
  cleanliness: 90,
  energy: 100,
  discipline: 50,
  intelligence: 30,
  weight: 0.5,

  isSleeping: false,
  lightsOff: false,
  isSick: false,
  sicknessType: null,
  isNaughty: false,
  naughtyType: null,
  poopCount: 0,

  lifetimeSnacksGiven: 0,
  lifetimeMealsGiven: 0,
  lifetimeMiniGamesWon: 0,
  lifetimeMiniGamesScore: 0,
  lifetimeBrushCount: 0,
  careMistakes: 0,
  evolutionHistory: ['cat_egg'],
  unlockedZukan: ['cat_egg'],

  coins: 50, // Initial pocket money for treats
  ownedItems: ['bowl_basic', 'brush_basic', 'toy_feather'],
  activeShell: 'classic_pink',
  activeBacklight: 'matrix_green',

  currentDateStr: getTodayString(),
  streakDays: 1,
  dailyTasks: generateDailyTasks(),
  careHistory: [],
  memories: [
    {
      id: 'mem_initial_egg',
      timestamp: Date.now(),
      dateStr: getTodayString(),
      inGameDay: 0,
      inGameHour: 10,
      category: 'evolution',
      title: '運命の出会い・たまごがやってきた！',
      story: '手のひらに収まるふしぎなたまご。耳をすますと小さくトクトクと鼓動が聞こえます。優しく温めて育てていこう！',
      catId: 'cat_egg',
      catName: 'たまごちゃん',
      weight: 0.5,
      sticker: '🥚',
    },
  ],

  soundEnabled: true,
};

export function loadSavedGame(): PetGameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as PetGameState;

    // Ensure memories array exists for older save data
    const existingMemories = Array.isArray(parsed.memories) && parsed.memories.length > 0
      ? parsed.memories
      : INITIAL_STATE.memories;

    // Daily rollover check
    const today = getTodayString();
    if (parsed.currentDateStr !== today) {
      const yesterdayAllDone = parsed.dailyTasks.every((t) => t.completed);
      const newStreak = yesterdayAllDone ? parsed.streakDays + 1 : 1;

      // Log previous day to care history
      const historyEntry = {
        date: parsed.currentDateStr,
        tasksCompleted: parsed.dailyTasks.filter((t) => t.completed).length,
        totalTasks: parsed.dailyTasks.length,
        catSpeciesId: parsed.catId,
        allClear: yesterdayAllDone,
      };

      const updatedHistory = [historyEntry, ...(parsed.careHistory || [])].slice(0, 30);

      return {
        ...parsed,
        memories: existingMemories,
        currentDateStr: today,
        streakDays: newStreak,
        dailyTasks: generateDailyTasks(),
        careHistory: updatedHistory,
      };
    }

    return {
      ...parsed,
      memories: existingMemories,
    };
  } catch (err) {
    console.error('Failed to load saved pet game:', err);
    return INITIAL_STATE;
  }
}

export function saveGameState(state: PetGameState) {
  try {
    const payload = {
      ...state,
      lastSaveTimestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save pet game:', err);
  }
}

export function resetGameStorage(): PetGameState {
  localStorage.removeItem(STORAGE_KEY);
  return { ...INITIAL_STATE, createdAt: Date.now() };
}
