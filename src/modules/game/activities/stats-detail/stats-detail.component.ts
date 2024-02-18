import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { filter, map, of, switchMap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { PlayerService } from 'src/services/player.service';

@Component({
  selector: 'app-stats-detail',
  templateUrl: './stats-detail.component.html',
  styleUrl: './stats-detail.component.scss',
})
export class StatsDetailComponent extends TemplatePage {
  public store: Store = inject(Store);
  @Input() player!: PlayerModel;
}
