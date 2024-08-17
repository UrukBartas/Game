import { Component, Input } from '@angular/core';
import { PlayerModel } from 'src/modules/core/models/player.model';

@Component({
  selector: 'app-generic-stats',
  templateUrl: './generic-stats.component.html',
  styleUrl: './generic-stats.component.scss',
})
export class GenericStatsComponent {
  @Input() cappedStats: any;
  @Input() simplified = false;
  @Input() player!: PlayerModel;
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
}
