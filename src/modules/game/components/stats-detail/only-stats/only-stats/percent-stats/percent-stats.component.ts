import { Component, Input } from '@angular/core';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getPercentage, getStatIconClass, getStatValueClass, getValueStatusClass, mapTotalPercentLabels } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-percent-stats',
  templateUrl: './percent-stats.component.html',
  styleUrl: './percent-stats.component.scss',
})
export class PercentStatsComponent {
  @Input() perStatItems: any;
  @Input() simplified = false;
  @Input() player!: PlayerModel;
  @Input() cappedPerStats: any;
  @Input() hoveredItemStats: any = null;
  public prefix = ViewportService.getPreffixImg();

  // Usar los métodos de utils.ts
  public getPercentage = getPercentage;
  public getStatIconClass = getStatIconClass;
  public getStatValueClass = getStatValueClass;
  public getValueStatusClass = getValueStatusClass;
  public mapTotalPercentLabels = mapTotalPercentLabels;
}
