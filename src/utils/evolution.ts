import { CatEvolutionId, CatSpeciesInfo, CAT_SPECIES } from '../types/cat';
import { PetGameState } from '../types/game';

export interface EvolutionCheckResult {
  canEvolve: boolean;
  nextCatId: CatEvolutionId | null;
  reason: string;
}

/**
 * Evaluates whether the current cat can evolve, and determines the target branch
 */
export function checkEvolution(state: PetGameState): EvolutionCheckResult {
  const currentCat = CAT_SPECIES[state.catId];

  // 1. Egg Stage -> Baby Stage
  if (currentCat.stage === 'egg') {
    if (state.eggTaps >= 5 || state.ageDays >= 0.05) {
      return {
        canEvolve: true,
        nextCatId: 'baby_fluff',
        reason: 'たまごを優しく温めたことで、元気なしろこねこが誕生しました！',
      };
    }
    return { canEvolve: false, nextCatId: null, reason: 'たまごをタップして温めましょう。' };
  }

  // 2. Baby Stage -> Child Stage (requires age >= 1 or sufficient care experience)
  if (currentCat.stage === 'baby') {
    const totalCare = state.lifetimeMealsGiven + state.lifetimeSnacksGiven + state.lifetimeBrushCount + state.lifetimeMiniGamesWon;
    if (state.ageDays >= 1 || totalCare >= 4) {
      // Divergence to Child:
      // High mini-games -> child_playful
      // High snacks & weight -> child_glutton
      // High discipline & cleanliness -> child_calm
      if (state.lifetimeMiniGamesWon >= 2) {
        return {
          canEvolve: true,
          nextCatId: 'child_playful',
          reason: '元気いっぱいに遊んで、やんちゃな三毛こねこに成長しました！',
        };
      }
      if (state.weight >= 1.6 || state.lifetimeSnacksGiven >= 3) {
        return {
          canEvolve: true,
          nextCatId: 'child_glutton',
          reason: 'おいしいごはんをたくさん食べて、まんまるな茶トラこねこに成長しました！',
        };
      }
      return {
        canEvolve: true,
        nextCatId: 'child_calm',
        reason: '丁寧なお世話で落ち着いた、賢いくろこねこに成長しました！',
      };
    }
    return { canEvolve: false, nextCatId: null, reason: 'あかちゃん期：すこしお世話を続けてみましょう。' };
  }

  // 3. Child Stage -> Adult Stage (requires age >= 3 or extensive care)
  if (currentCat.stage === 'child') {
    const totalInteractions = state.lifetimeMealsGiven + state.lifetimeBrushCount + state.lifetimeMiniGamesWon;
    if (state.ageDays >= 3 || totalInteractions >= 8) {
      // Secret 1: Manekineko (Lucky Cat) -> 0 care mistakes, coins >= 60, discipline >= 80
      if (state.careMistakes === 0 && state.coins >= 60 && state.discipline >= 75) {
        return {
          canEvolve: true,
          nextCatId: 'adult_manekineko',
          reason: '【奇跡の進化】完璧なお世話と徳の積み重ねにより、大吉を呼ぶ「福徳の招き猫」へと変貌を遂げました！',
        };
      }

      // Secret 2: Sorcerer Cat -> High intelligence (>=75), high happiness, nighttime care
      if (state.intelligence >= 75 && state.happiness >= 80 && (state.inGameHour >= 21 || state.inGameHour <= 4)) {
        return {
          canEvolve: true,
          nextCatId: 'adult_sorcerer',
          reason: '【秘術の進化】夜空の星たちと強い絆で結ばれ、神秘の「星詠みマジカルネコ」に覚醒しました！',
        };
      }

      // Standard Branches based on parenting style:
      // A: Athlete Calico (high mini games)
      if (state.lifetimeMiniGamesWon >= 5 || state.lifetimeMiniGamesScore >= 120) {
        return {
          canEvolve: true,
          nextCatId: 'adult_mike',
          reason: '抜群の運動神経を活かして、アクロバティックな「三毛アスリート」へと進化しました！',
        };
      }

      // B: Chubby Tabby (heavyweight, high snacks)
      if (state.weight >= 4.2 || state.lifetimeSnacksGiven >= 5) {
        return {
          canEvolve: true,
          nextCatId: 'adult_chatora',
          reason: 'ごはんとお昼寝をこよなく愛する、もふもふ巨漢「ぽっちゃり茶トラ」へと進化しました！',
        };
      }

      // C: Intelligent Black Cat (high discipline, zero to low mistakes)
      if (state.discipline >= 70 && state.careMistakes <= 1) {
        return {
          canEvolve: true,
          nextCatId: 'adult_kuro',
          reason: '聡明な気品と落ち着きを宿した、夜の哲学者「インテリ黒猫」へと進化しました！',
        };
      }

      // D: Princess White Cat (high cleanliness, lots of brushing)
      if (state.cleanliness >= 80 && state.lifetimeBrushCount >= 6) {
        return {
          canEvolve: true,
          nextCatId: 'adult_shiro',
          reason: '極上のグルーミングで優美に輝く「白猫プリンセス」へと進化しました！',
        };
      }

      // E: Siamese Dancer (high communication/petting)
      if (state.lifetimeBrushCount >= 4 && state.happiness >= 75) {
        return {
          canEvolve: true,
          nextCatId: 'adult_siamese',
          reason: '社交的で美しい足取りを持つ「シャムダンサー」へと進化しました！',
        };
      }

      // F: Default Balanced -> Gentle Hachiware
      return {
        canEvolve: true,
        nextCatId: 'adult_hachiware',
        reason: '家族に寄り添う優しい癒やし手「おっとりハチワレ」へと進化しました！',
      };
    }
    return { canEvolve: false, nextCatId: null, reason: 'こども期：おとなになるまでお世話を続けましょう。' };
  }

  // 4. Adult Stage -> Legendary Stage (requires age >= 7, all stats high or secret cat evolution)
  if (currentCat.stage === 'adult') {
    if (state.ageDays >= 7 || (state.streakDays >= 3 && state.happiness >= 90 && state.discipline >= 80)) {
      if (state.catId === 'adult_manekineko' || state.catId === 'adult_sorcerer') {
        return {
          canEvolve: true,
          nextCatId: 'legend_celestial',
          reason: '【神話覚醒】神秘の猫が天界の光を纏い、奇跡の「月影の天翼ネコ」へと昇華しました！',
        };
      }
      return {
        canEvolve: true,
        nextCatId: 'legend_royalty',
        reason: '【伝説覚醒】長きにわたる愛情を受け、百獣を統べる「キングライオンネコ」へと戴冠しました！',
      };
    }
    return { canEvolve: false, nextCatId: null, reason: '成猫期：毎日大切にお世話を重ねると伝説へ覚醒します。' };
  }

  return { canEvolve: false, nextCatId: null, reason: '最高の最終形態に達しています！' };
}
