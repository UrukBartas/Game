import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-leaderboard-tutorial',
  templateUrl: './leaderboard-tutorial.component.html',
  styleUrl: './leaderboard-tutorial.component.scss',
})
export class LeaderboardTutorialComponent {
  public prefix = ViewportService.getPreffixImg();
}
