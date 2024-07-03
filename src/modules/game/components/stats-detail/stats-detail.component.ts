import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { StatsService } from 'src/services/stats.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-stats-detail',
  templateUrl: './stats-detail.component.html',
  styleUrl: './stats-detail.component.scss',
})
export class StatsDetailComponent extends TemplatePage {
  public store: Store = inject(Store);
  @Input() player!: PlayerModel;
  @Input() isViewingAnotherPlayer = false;
  public stats = inject(StatsService);
  public cappedStats$ = this.stats.getCappedStats();

  private viewportService = inject(ViewportService);

  public getPlayerImageSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 120;
    }
    return 180;
  }
}
