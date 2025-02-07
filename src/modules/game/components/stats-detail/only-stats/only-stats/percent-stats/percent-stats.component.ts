import { Component, Input } from '@angular/core';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ViewportService } from 'src/services/viewport.service';
import { getPercentage, mapTotalPercentLabels } from 'src/standalone/item-tooltip/item-tooltip.component';

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
  public mapTotalPercentLabels = mapTotalPercentLabels;
  public getPercentage(key: string) {
    return getPercentage(key);
  }
}
