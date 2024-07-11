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
  public statItems = [
    {
      label: 'Life',
      key: 'health',
      tooltip: 'Total health points of the character',
    },
    {
      label: 'Armor',
      key: 'armor',
      tooltip:
        'Reduce incoming damage, reduction is correlated to health (max 50%)',
    },
    {
      label: 'Energy',
      key: 'energy',
      tooltip: 'Consumed when attacking (40), lack of it reduces damage dealt',
    },
    { label: 'Damage', key: 'damage', tooltip: 'Base damage points' },
    {
      label: 'Speed',
      key: 'speed',
      tooltip: 'In a tie context, will decide the winner',
    },
    {
      label: 'PN',
      key: 'penetration',
      tooltip:
        'Reduce in a percent the armor of the opponent (deal more damage)',
      suffix: '%',
    },
    {
      label: 'Crit',
      key: 'crit',
      tooltip: 'Chance of doubling the final calculated damage',
      suffix: '%',
    },
    {
      label: 'Dodge',
      key: 'dodge',
      tooltip: 'Chance of making an opponent miss an attack',
      suffix: '%',
    },
    {
      label: 'Block',
      key: 'block',
      tooltip: 'Chance of blocking an opponent attack',
      suffix: '%',
    },
    {
      label: 'Accuracy',
      key: 'accuracy',
      tooltip: 'Reduces the chance of missing an attack',
      suffix: '%',
    },
  ];

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
