import { Component, Input } from '@angular/core';
import { PlayerModel } from 'src/modules/core/models/player.model';

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
}
