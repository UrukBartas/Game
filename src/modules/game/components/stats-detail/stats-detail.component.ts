import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { map } from 'rxjs';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-stats-detail',
  templateUrl: './stats-detail.component.html',
  styleUrl: './stats-detail.component.scss',
})
export class StatsDetailComponent {
  private viewportService = inject(ViewportService);
  public store: Store = inject(Store);
  public player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));

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
