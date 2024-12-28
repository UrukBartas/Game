import { Component, Input } from '@angular/core';
import { BuffType } from 'src/modules/core/models/fight-buff.model';
import { FighterStats } from 'src/modules/core/models/player-stats.model';

@Component({
  selector: 'app-fighter-status',
  templateUrl: './fighter-status.component.html',
  styleUrl: './fighter-status.component.scss',
})
export class FighterStatusComponent {
  @Input() fighterStatus: FighterStats;
  buffType = BuffType;
}
