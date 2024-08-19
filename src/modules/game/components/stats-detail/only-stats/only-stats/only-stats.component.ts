import { Component, Input, inject } from '@angular/core';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { StatsService } from 'src/services/stats.service';

@Component({
  selector: 'app-only-stats',
  templateUrl: './only-stats.component.html',
  styleUrl: './only-stats.component.scss',
})
export class OnlyStatsComponent {
  @Input() player!: PlayerModel;
  @Input() simplified = false;
  public statsService = inject(StatsService);
  public cappedStats$ = this.statsService.getCappedStats();
  public cappedPerStats$ = this.statsService.getCappedPerStats();


  public perStatItems = [
    {
      label: 'Life',
      key: 'totalPerHealth',
      tooltip: 'Total percentage of life added by the rarity bonuses',
    },
    {
      label: 'Armor',
      key: 'totalPerArmor',
      tooltip: 'Total percentage of armor added by the rarity bonuses',
    },
    {
      label: 'Energy',
      key: 'totalPerEnergy',
      tooltip: 'Total percentage of energy added by the rarity bonuses',
    },
    {
      label: 'Damage',
      key: 'totalPerDamage',
      tooltip: 'Total percentage of damage added by the rarity bonuses',
    },
    {
      label: 'Speed',
      key: 'totalPerSpeed',
      tooltip: 'Total percentage of speed added by the rarity bonuses',
    },
    {
      label: 'PN',
      key: 'totalPerPenetration',
      tooltip: 'Total percentage of penetration added by the rarity bonuses',
    },
    {
      label: 'Crit',
      key: 'totalPerCrit',
      tooltip: 'Total percentage of crit added by the rarity bonuses',
    },
    {
      label: 'Dodge',
      key: 'totalPerDodge',
      tooltip: 'Total percentage of dodge added by the rarity bonuses',
    },
    {
      label: 'Block',
      key: 'totalPerBlock',
      tooltip: 'Total percentage of block added by the rarity bonuses',
    },
    {
      label: 'Accuracy',
      key: 'totalPerAccuracy',
      tooltip: 'Total percentage of accuracy added by the rarity bonuses',
    },
  ];
}
