import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { combineLatest, map } from 'rxjs';
import {
  Deed,
  DeedId,
  PlayerModel,
} from 'src/modules/core/models/player.model';
import { CompareItemPipe } from 'src/modules/core/pipes/compare-item.pipe';
import { ItemService } from 'src/services/item.service';
import { PlayerService } from 'src/services/player.service';
import { StatsService } from 'src/services/stats.service';
import { getLoopableStatsKeys } from 'src/standalone/item-tooltip/item-tooltip.component';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-only-stats',
  templateUrl: './only-stats.component.html',
  styleUrl: './only-stats.component.scss',
})
export class OnlyStatsComponent {
  @Input() player!: PlayerModel;
  @Input() simplified = false;
  public statsService = inject(StatsService);
  public playerService = inject(PlayerService);
  itemService = inject(ItemService);
  compareWith = inject(CompareItemPipe);
  store = inject(Store);
  public cappedStats$ = this.statsService.getCappedStats();
  public cappedPerStats$ = this.statsService.getCappedPerStats();
  public playerDeeds$ = this.playerService.getPlayerDeeds();
  public player$ = this.store.select(MainState.getState).pipe(
    map((entry) => {
      return entry.player;
    })
  );
  public combinedPlayerHoveredItem$ = combineLatest([
    this.player$,
    this.itemService.hoveredItem$,
  ]).pipe(
    map((res) => {
      const [player, hoveredItem] = res;
      const statsChange = {};
      if (!hoveredItem) return null;
      const foundAlreadyEquippedItem = player.items.find(
        (item) => item.itemData.itemType == hoveredItem.itemData.itemType
      );
      const [nonPorcentualStats, percentualStats] = getLoopableStatsKeys(
        foundAlreadyEquippedItem ?? hoveredItem
      );
      [...nonPorcentualStats, ...percentualStats].forEach((stat) => {
        statsChange[stat] = this.compareWith.transform(
          hoveredItem,
          foundAlreadyEquippedItem,
          stat
        );
      });

      return statsChange;
    })
  );
  public perStatItems = [
    {
      label: 'Life',
      key: 'totalPerHealth',
      tooltip: 'Total percentage of life added by the rarity bonuses',
      icon: '/assets/icons/health-normal.png',
    },
    {
      label: 'Armor',
      key: 'totalPerArmor',
      tooltip: 'Total percentage of armor added by the rarity bonuses',
      icon: '/assets/icons/armor-vest.png',
    },
    {
      label: 'Energy',
      key: 'totalPerEnergy',
      tooltip: 'Total percentage of energy added by the rarity bonuses',
      icon: '/assets/icons/embrassed-energy.png',
    },
    {
      label: 'Damage',
      key: 'totalPerDamage',
      tooltip: 'Total percentage of damage added by the rarity bonuses',
      icon: '/assets/icons/biceps.png',
    },
    {
      label: 'Speed',
      key: 'totalPerSpeed',
      tooltip: 'Total percentage of speed added by the rarity bonuses',
      icon: '/assets/icons/sprint.png',
    },
    {
      label: 'PN',
      key: 'totalPerPenetration',
      tooltip: 'Total percentage of penetration added by the rarity bonuses',
      icon: '/assets/icons/cracked-shield.png',
    },
    {
      label: 'Crit',
      key: 'totalPerCrit',
      tooltip: 'Total percentage of crit added by the rarity bonuses',
      icon: '/assets/icons/explosion-rays.png',
    },
    {
      label: 'Dodge',
      key: 'totalPerDodge',
      tooltip: 'Total percentage of dodge added by the rarity bonuses',
      icon: '/assets/icons/dodging.png',
    },
    {
      label: 'Block',
      key: 'totalPerBlock',
      tooltip: 'Total percentage of block added by the rarity bonuses',
      icon: '/assets/icons/shield-bounces.png',
    },
    {
      label: 'Acc',
      key: 'totalPerAccuracy',
      tooltip: 'Total percentage of accuracy added by the rarity bonuses',
      icon: '/assets/icons/bullseye.png',
    },
  ];

  public getPlayerDeed(deedId: DeedId, deedsPlayer: Array<Deed>) {
    return deedsPlayer.find((entry) => entry.deedDataId == deedId) as Deed & {
      currentTierIndex: number;
    };
  }
}
