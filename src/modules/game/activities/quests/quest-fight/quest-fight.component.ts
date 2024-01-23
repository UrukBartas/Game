import { Component, EventEmitter, Output, inject } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { Store } from '@ngxs/store';
import { MainState } from 'src/store/main.store';
import { ViewportService } from 'src/services/viewport.service';

enum QuestRarity {
  COMMON = 1.0,
  UNCOMMON = 2,
  EPIC = 3,
  LEGENDARY = 5,
  MYTHIC = 10,
}

@Component({
  selector: 'app-quest-fight',
  templateUrl: './quest-fight.component.html',
  styleUrl: './quest-fight.component.scss',
})
export class QuestFightComponent extends TemplatePage {
  private store = inject(Store);
  private viewportService = inject(ViewportService);
  @Output() questStatusChange = new EventEmitter<QuestStatusEnum>();
  player: PlayerModel = this.store.selectSnapshot(MainState.getState).player;

  getHealthBarHeight() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 50;
      case 'md':
        return 40;
      case 'xs':
      case 'sm':
      default:
        return 30;
    }
  }

  getButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 'btn-lg';
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 'btn-md';
    }
  }
}

/* private calculateXPForLevel(level: number): number {
    const baseXP = 10; // XP required for the first level
    const multiplier = 1.05; // Exponential growth factor
    return Math.round(baseXP * Math.pow(multiplier, level - 1));
  }

  private calculateRewardedXP(level: number, rarityMultiplier: number): number {
    const baseQuestXP = 5; // Base XP for quests
    const questMultiplier = 1.04; // Growth factor for quests

    return Math.round(
      baseQuestXP * Math.pow(questMultiplier, level - 1) * rarityMultiplier
    );
  }

  private logResult() {
    let levels = 200;
    for (let level = 1; level <= levels; level++) {
      const levelExp = this.calculateXPForLevel(level);
      console.log(
        `Level ${level}: Player XP = ${this.calculateXPForLevel(level)}`
      );
      for (let rarity in QuestRarity) {
        if (!isNaN(Number(rarity))) {
          const questXP = this.calculateRewardedXP(level, Number(rarity));
          console.log(
            `Quest Rarity ${QuestRarity[rarity]}: Percent ${Math.round(
              levelExp / questXP
            )}, XP = ${questXP}`
          );
        }
      }
    }
  } */
