import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { StatsService } from 'src/services/stats.service';
import { ViewportService } from 'src/services/viewport.service';
import { pvpTiers } from '../../activities/leadeboard/const/pvp-tiers';
import { getRarityColor } from 'src/modules/utils';
import { questTiers } from '../../activities/leadeboard/const/quest-tiers';

@Component({
  selector: 'app-stats-detail',
  templateUrl: './stats-detail.component.html',
  styleUrls: ['./stats-detail.component.scss'],
})
export class StatsDetailComponent extends TemplatePage {
  public store: Store = inject(Store);
  @Input() player!: PlayerModel;
  @Input() isViewingAnotherPlayer = false;


  private viewportService = inject(ViewportService);
  getRarityColor = getRarityColor;

  public getPlayerImageSize() {
    if (
      this.viewportService.screenSize === 'xs' ||
      this.viewportService.screenSize === 'sm' ||
      this.viewportService.screenSize === 'md'
    ) {
      return 120;
    }
    return 180;
  }

  public getPvpTier(pvpIndex: number) {
    return pvpTiers.find(
      (tier) => pvpIndex >= tier.range[0] && pvpIndex <= tier.range[1]
    );
  }

  public getQuestTier(questCount: number) {
    return questTiers.find((tier) => questCount <= tier.maxQuests);
  }


}
