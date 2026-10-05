import { useState, useEffect, useCallback, useRef } from 'react';
import { PetGameState, ActiveModal, ShellColorId, LcdBacklightId } from '../types/game';
import { CatEvolutionId, CAT_SPECIES } from '../types/cat';
import { loadSavedGame, saveGameState, resetGameStorage } from '../utils/storage';
import { checkEvolution } from '../utils/evolution';
import { soundManager } from '../utils/audio';

export function usePetGame() {
  const [state, setState] = useState<PetGameState>(loadSavedGame);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedMenuIdx, setSelectedMenuIdx] = useState<number | null>(null);

  // For evolution celebration
  const [evolutionPending, setEvolutionPending] = useState<{
    previousCatId: CatEvolutionId;
    newCatId: CatEvolutionId;
    reason: string;
  } | null>(null);

  // Auto-save on state changes
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // Sync sound settings with soundManager
  useEffect(() => {
    soundManager.setEnabled(state.soundEnabled);
  }, [state.soundEnabled]);

  // Periodic Simulation Tick (every 10s is 1 mini-tick, advances clock and vitals)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setState((prev) => {
        if (!prev.hatched) return prev;

        // Vitals decay
        const hungerDelta = prev.isSleeping ? 0.2 : 0.8;
        const happinessDelta = prev.poopCount > 0 ? 1.5 : 0.4;
        const cleanlinessDelta = prev.poopCount > 0 ? 1.2 : 0.3;

        let newHunger = Math.max(0, prev.hunger - hungerDelta);
        let newHappiness = Math.max(0, prev.happiness - happinessDelta);
        let newCleanliness = Math.max(0, prev.cleanliness - cleanlinessDelta);
        let newEnergy = prev.isSleeping ? Math.min(100, prev.energy + 3) : Math.max(0, prev.energy - 0.5);

        // Check if care mistake occurred (hunger reached 0 or 3 poops untouched)
        let newMistakes = prev.careMistakes;
        if (newHunger === 0 && Math.random() > 0.8) {
          newMistakes += 1;
        }

        // Random poop occurrence (only if fed and not sleeping)
        let newPoops = prev.poopCount;
        if (!prev.isSleeping && newPoops < 3 && Math.random() < 0.05) {
          newPoops += 1;
        }

        // Sickness chance if unclean or starved
        let newIsSick = prev.isSick;
        let sicknessType = prev.sicknessType;
        if (!prev.isSick && (newCleanliness < 25 || newHunger < 10) && Math.random() < 0.15) {
          newIsSick = true;
          sicknessType = newCleanliness < 25 ? 'お部屋が汚くて風邪をひいた' : 'お腹が空きすぎて胃痛';
          soundManager.playSickWarning();
        }

        // Random naughty act if high energy and awake
        let newIsNaughty = prev.isNaughty;
        let newNaughtyType = prev.naughtyType;
        if (!prev.isSleeping && !prev.isNaughty && !prev.isSick && Math.random() < 0.03) {
          newIsNaughty = true;
          const acts: Array<'scratching' | 'knocking_cup' | 'midnight_zoomies'> = [
            'scratching',
            'knocking_cup',
            'midnight_zoomies',
          ];
          newNaughtyType = acts[Math.floor(Math.random() * acts.length)];
        }

        return {
          ...prev,
          hunger: Math.round(newHunger * 10) / 10,
          happiness: Math.round(newHappiness * 10) / 10,
          cleanliness: Math.round(newCleanliness * 10) / 10,
          energy: Math.round(newEnergy * 10) / 10,
          careMistakes: newMistakes,
          poopCount: newPoops,
          isSick: newIsSick,
          sicknessType,
          isNaughty: newIsNaughty,
          naughtyType: newNaughtyType,
        };
      });
    }, 12000);

    return () => clearInterval(tickInterval);
  }, []);

  // Helper to mark a daily task as completed and grant coins
  const completeTask = useCallback((taskId: string) => {
    setState((prev) => {
      let coinsBonus = 0;
      let tasksUpdated = false;

      const updatedTasks = prev.dailyTasks.map((task) => {
        if (task.id === taskId && !task.completed) {
          coinsBonus += task.rewardCoins;
          tasksUpdated = true;
          return { ...task, completed: true };
        }
        return task;
      });

      if (!tasksUpdated) return prev;

      // Check if all tasks are complete
      const allDone = updatedTasks.every((t) => t.completed);
      const totalBonus = coinsBonus + (allDone ? 40 : 0); // 40 extra for all clear!

      return {
        ...prev,
        dailyTasks: updatedTasks,
        coins: prev.coins + totalBonus,
      };
    });
  }, []);

  // Check evolution after actions
  const triggerEvolutionCheck = useCallback(() => {
    setState((prev) => {
      const result = checkEvolution(prev);
      if (result.canEvolve && result.nextCatId && result.nextCatId !== prev.catId) {
        const nextId = result.nextCatId;
        const nextSpecies = CAT_SPECIES[nextId];

        setEvolutionPending({
          previousCatId: prev.catId,
          newCatId: nextId,
          reason: result.reason,
        });

        const newUnlocked = prev.unlockedZukan.includes(nextId)
          ? prev.unlockedZukan
          : [...prev.unlockedZukan, nextId];

        return {
          ...prev,
          catId: nextId,
          stage: nextSpecies.stage,
          hatched: true,
          happiness: 100,
          hunger: Math.max(70, prev.hunger),
          cleanliness: 100,
          evolutionHistory: [...prev.evolutionHistory, nextId],
          unlockedZukan: newUnlocked,
          coins: prev.coins + 30, // evolution reward
        };
      }
      return prev;
    });
  }, []);

  // --- Care Actions ---

  // Egg Tap (Hatching)
  const handleEggTap = useCallback(() => {
    setState((prev) => {
      const nextTaps = prev.eggTaps + 1;
      if (nextTaps >= 5 && !prev.hatched) {
        soundManager.playHatch();
        // Hatch into baby
        const nextId: CatEvolutionId = 'baby_fluff';
        const newUnlocked = prev.unlockedZukan.includes(nextId)
          ? prev.unlockedZukan
          : [...prev.unlockedZukan, nextId];

        setEvolutionPending({
          previousCatId: 'cat_egg',
          newCatId: nextId,
          reason: 'たまごがパカッと割れて、元気なしろこねこが生まれました！',
        });

        return {
          ...prev,
          hatched: true,
          catId: nextId,
          stage: 'baby',
          eggTaps: nextTaps,
          unlockedZukan: newUnlocked,
          happiness: 100,
          hunger: 80,
          cleanliness: 100,
        };
      }
      return { ...prev, eggTaps: nextTaps };
    });
  }, []);

  // Direct pet touch
  const handleDirectPetTouch = useCallback(() => {
    setState((prev) => {
      if (!prev.hatched) return prev;
      soundManager.playMeow('happy');
      return {
        ...prev,
        happiness: Math.min(100, prev.happiness + 8),
        lifetimeBrushCount: prev.lifetimeBrushCount + 1,
      };
    });
    completeTask('task_brush');
    triggerEvolutionCheck();
  }, [completeTask, triggerEvolutionCheck]);

  // Feed Meal
  const handleFeedMeal = useCallback(
    (foodName: string, hungerVal: number, weightVal: number) => {
      setState((prev) => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + hungerVal),
        weight: Math.round((prev.weight + weightVal) * 10) / 10,
        lifetimeMealsGiven: prev.lifetimeMealsGiven + 1,
        happiness: Math.min(100, prev.happiness + 5),
      }));
      completeTask('task_meal');
      triggerEvolutionCheck();
    },
    [completeTask, triggerEvolutionCheck]
  );

  // Feed Snack
  const handleFeedSnack = useCallback(
    (snackName: string, happinessVal: number, hungerVal: number, weightVal: number) => {
      setState((prev) => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + happinessVal),
        hunger: Math.min(100, prev.hunger + hungerVal),
        weight: Math.round((prev.weight + weightVal) * 10) / 10,
        lifetimeSnacksGiven: prev.lifetimeSnacksGiven + 1,
      }));
      completeTask('task_snack');
      triggerEvolutionCheck();
    },
    [completeTask, triggerEvolutionCheck]
  );

  // Clean Toilet
  const handleCleanToilet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      poopCount: 0,
      cleanliness: Math.min(100, prev.cleanliness + 30),
      happiness: Math.min(100, prev.happiness + 10),
    }));
    completeTask('task_toilet');
    triggerEvolutionCheck();
  }, [completeTask, triggerEvolutionCheck]);

  // Shampoo & Bath
  const handleBath = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cleanliness: 100,
      happiness: Math.min(100, prev.happiness + 15),
      lifetimeBrushCount: prev.lifetimeBrushCount + 2,
    }));
    completeTask('task_brush');
    triggerEvolutionCheck();
  }, [completeTask, triggerEvolutionCheck]);

  // Brushing
  const handleBrush = useCallback(() => {
    soundManager.playBrush();
    soundManager.playPurr();
    setState((prev) => ({
      ...prev,
      cleanliness: Math.min(100, prev.cleanliness + 20),
      happiness: Math.min(100, prev.happiness + 20),
      lifetimeBrushCount: prev.lifetimeBrushCount + 1,
    }));
    completeTask('task_brush');
    triggerEvolutionCheck();
  }, [completeTask, triggerEvolutionCheck]);

  // Discipline: Scold
  const handleScold = useCallback(() => {
    setState((prev) => {
      const wasNaughty = prev.isNaughty;
      return {
        ...prev,
        isNaughty: false,
        naughtyType: null,
        discipline: Math.min(100, prev.discipline + (wasNaughty ? 20 : 5)),
        happiness: Math.max(0, prev.happiness - (wasNaughty ? 5 : 15)),
      };
    });
    triggerEvolutionCheck();
  }, [triggerEvolutionCheck]);

  // Discipline: Praise
  const handlePraise = useCallback(() => {
    soundManager.playMeow('happy');
    setState((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      discipline: Math.min(100, prev.discipline + 8),
    }));
    triggerEvolutionCheck();
  }, [triggerEvolutionCheck]);

  // Heal / Medicine
  const handleHeal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSick: false,
      sicknessType: null,
      happiness: Math.min(100, prev.happiness + 25),
      hunger: Math.max(50, prev.hunger),
    }));
  }, []);

  // Mini-game completed
  const handleMiniGameComplete = useCallback(
    (score: number, coinsEarned: number) => {
      setState((prev) => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 30),
        energy: Math.max(10, prev.energy - 15),
        intelligence: Math.min(100, prev.intelligence + 10),
        lifetimeMiniGamesWon: prev.lifetimeMiniGamesWon + 1,
        lifetimeMiniGamesScore: prev.lifetimeMiniGamesScore + score,
        coins: prev.coins + coinsEarned,
      }));
      completeTask('task_game');
      triggerEvolutionCheck();
    },
    [completeTask, triggerEvolutionCheck]
  );

  // Toggle Light / Bedtime
  const handleToggleLight = useCallback(() => {
    soundManager.playSelect();
    setState((prev) => {
      const nextLight = !prev.lightsOff;
      const nextSleep = nextLight; // If light off, sleep
      if (nextLight) {
        completeTask('task_sleep');
      }
      return {
        ...prev,
        lightsOff: nextLight,
        isSleeping: nextSleep,
        energy: nextSleep ? Math.min(100, prev.energy + 20) : prev.energy,
      };
    });
  }, [completeTask]);

  // Execute Menu Icon Selection (Physical B button or Icon Click)
  const handleExecuteSelectedIcon = useCallback(
    (iconIdx: number) => {
      switch (iconIdx) {
        case 0: // Food
          setActiveModal('menu_food');
          break;
        case 1: // Light
          handleToggleLight();
          break;
        case 2: // Play
          setActiveModal('menu_play');
          break;
        case 3: // Medicine
          setActiveModal('menu_medicine');
          break;
        case 4: // Clean
          setActiveModal('menu_clean');
          break;
        case 5: // Brush
          handleBrush();
          break;
        case 6: // Discipline
          setActiveModal('menu_discipline');
          break;
        case 7: // Status
          setActiveModal('menu_status');
          break;
        default:
          break;
      }
    },
    [handleToggleLight, handleBrush]
  );

  // Time machine fast-forwards
  const handleAdvanceHours = useCallback(
    (hours: number) => {
      setState((prev) => {
        const nextHour = (prev.inGameHour + hours) % 24;
        const daysAdded = Math.floor((prev.inGameHour + hours) / 24);
        const hungerDrop = hours * 8;
        const cleanDrop = hours * 6;

        return {
          ...prev,
          inGameHour: nextHour,
          ageDays: prev.ageDays + daysAdded,
          hunger: Math.max(10, prev.hunger - hungerDrop),
          cleanliness: Math.max(10, prev.cleanliness - cleanDrop),
        };
      });
      triggerEvolutionCheck();
    },
    [triggerEvolutionCheck]
  );

  const handleAdvanceDays = useCallback(
    (days: number) => {
      setState((prev) => ({
        ...prev,
        ageDays: prev.ageDays + days,
        streakDays: prev.streakDays + days,
      }));
      triggerEvolutionCheck();
    },
    [triggerEvolutionCheck]
  );

  // Fast Evolve Trigger
  const handleForceEvolve = useCallback(() => {
    setState((prev) => {
      const forcedAgeState: PetGameState = {
        ...prev,
        ageDays: prev.stage === 'baby' ? 2 : prev.stage === 'child' ? 4 : 8,
        lifetimeMealsGiven: prev.lifetimeMealsGiven + 5,
        lifetimeMiniGamesWon: prev.lifetimeMiniGamesWon + 4,
        lifetimeBrushCount: prev.lifetimeBrushCount + 5,
      };
      const result = checkEvolution(forcedAgeState);
      if (result.canEvolve && result.nextCatId) {
        const nextId = result.nextCatId;
        const nextSpecies = CAT_SPECIES[nextId];
        setEvolutionPending({
          previousCatId: prev.catId,
          newCatId: nextId,
          reason: result.reason,
        });

        const newUnlocked = prev.unlockedZukan.includes(nextId)
          ? prev.unlockedZukan
          : [...prev.unlockedZukan, nextId];

        return {
          ...forcedAgeState,
          catId: nextId,
          stage: nextSpecies.stage,
          hatched: true,
          evolutionHistory: [...prev.evolutionHistory, nextId],
          unlockedZukan: newUnlocked,
        };
      }
      return prev;
    });
  }, []);

  // Rename Cat
  const handleRename = useCallback((newName: string) => {
    setState((prev) => ({ ...prev, catName: newName }));
  }, []);

  // Shop Buy
  const handleBuyItem = useCallback((itemId: string, cost: number) => {
    setState((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - cost),
      ownedItems: prev.ownedItems.includes(itemId) ? prev.ownedItems : [...prev.ownedItems, itemId],
    }));
  }, []);

  // Customization
  const handleSetShell = useCallback((shell: ShellColorId) => {
    setState((prev) => ({ ...prev, activeShell: shell }));
  }, []);

  const handleSetBacklight = useCallback((light: LcdBacklightId) => {
    setState((prev) => ({ ...prev, activeBacklight: light }));
  }, []);

  // Reset Game
  const handleResetGame = useCallback(() => {
    const newState = resetGameStorage();
    setState(newState);
    setActiveModal(null);
  }, []);

  // Sound Toggle
  const handleToggleSound = useCallback(() => {
    setState((prev) => {
      const next = !prev.soundEnabled;
      soundManager.setEnabled(next);
      return { ...prev, soundEnabled: next };
    });
  }, []);

  return {
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
  };
}
