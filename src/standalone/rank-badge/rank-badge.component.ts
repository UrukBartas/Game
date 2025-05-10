import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { pvpTiers } from 'src/modules/game/activities/leadeboard/const/pvp-tiers';
import { QuestTier, questTiers } from 'src/modules/game/activities/leadeboard/const/quest-tiers';
import { getRarityColor } from 'src/modules/utils';

@Component({
  selector: 'app-rank-badge',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './rank-badge.component.html',
  styleUrl: './rank-badge.component.scss'
})
export class RankBadgeComponent {
  @Input() type: 'pve' | 'pvp' = 'pve';
  @Input() player: any;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  Infinity = Infinity;
  questTiers = questTiers;
  pvpTiers = pvpTiers;
  getRarityColor = getRarityColor;

  getCurrentTier() {
    if (this.type === 'pve') {
      return this.getTitleForQuestsCompleted(this.player.finishedQuestsCount);
    } else {
      return this.pvpTiers.find(
        (tier) =>
          this.player.pvpIndex >= tier.range[0] &&
          this.player.pvpIndex <= tier.range[1]
      );
    }
  }

  getTitleForQuestsCompleted(questsCompleted: number): QuestTier {
    for (let i = questTiers.length - 1; i >= 0; i--) {
      if (questsCompleted >= questTiers[i].maxQuests) {
        return questTiers[i];
      }
    }
    return questTiers[0];
  }

  getProgressPercentage(completedQuests: number, currentTier: any): number {
    const nextTierQuests = this.getNextTierQuests(currentTier);
    const prevTierQuests = this.getPrevTierQuests(currentTier);

    if (nextTierQuests === Infinity) {
      return 100;
    }

    const tierProgress = completedQuests - prevTierQuests;
    const tierRange = nextTierQuests - prevTierQuests;
    return Math.min(100, Math.floor((tierProgress / tierRange) * 100));
  }

  getNextTierQuests(currentTier: any): number {
    const currentIndex = this.questTiers.findIndex(tier => tier.title === currentTier.title);
    if (currentIndex === this.questTiers.length - 1) {
      return Infinity;
    }
    return this.questTiers[currentIndex + 1].maxQuests;
  }

  getPrevTierQuests(currentTier: any): number {
    const currentIndex = this.questTiers.findIndex(tier => tier.title === currentTier.title);
    if (currentIndex === 0) {
      return 0;
    }
    return this.questTiers[currentIndex - 1].maxQuests;
  }

  isPvpTierAchieved(player: any, tier: any): boolean {
    return player.pvpIndex >= tier.range[0] && player.pvpIndex <= tier.range[1];
  }
}
