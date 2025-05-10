import { Component, Input } from '@angular/core';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getPercentage, getStatIconClass, getStatValueClass, getValueStatusClass } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';


export const totalStatsToPercentualStats = {
  totalPerHealth: 'per_health',
  totalPerDamage: 'per_damage',
  totalPerArmor: 'per_armor',
  totalPerSpeed: 'per_speed',
  totalPerEnergy: 'per_energy',
  totalPerDodge: 'per_dodge',
  totalPerCrit: 'per_crit',
  totalPerBlock: 'per_block',
  totalPerAccuracy: 'per_accuracy',
  totalPerPenetration: 'per_penetration',
};

@Component({
  selector: 'app-percent-stats',
  templateUrl: './percent-stats.component.html',
  styleUrl: './percent-stats.component.scss',
})
export class PercentStatsComponent {
  @Input() perStatItems: any;
  @Input() player!: PlayerModel;
  @Input() cappedPerStats: any;
  @Input() hoveredItemStats: any = null;
  @Input() allowUpgrade = false;
  public prefix = ViewportService.getPreffixImg();
  public totalStatsToPercentualStats = totalStatsToPercentualStats;
  // Usar los métodos de utils.ts
  public getPercentage = getPercentage;
  public getStatIconClass = getStatIconClass;
  public getStatValueClass = getStatValueClass;
  public getValueStatusClass = getValueStatusClass;

  ngOnInit(): void {
  }
}
