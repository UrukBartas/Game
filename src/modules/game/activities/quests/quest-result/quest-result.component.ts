import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { FightResultModel } from 'src/modules/core/models/fight.model';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, UpdatePlayer } from 'src/store/main.store';
import * as party from 'party-js';

@Component({
  selector: 'app-quest-result',
  templateUrl: './quest-result.component.html',
  styleUrl: './quest-result.component.scss',
})
export class QuestResultComponent extends TemplatePage {
  @ViewChild('lootItem', { read: ElementRef }) loot: ElementRef;
  fightResult: FightResultModel;
  store = inject(Store);
  viewportService = inject(ViewportService);
  victory = false;
  player = this.store.selectSnapshot(MainState.getState).player;
  getRarityColor = getRarityColor;

  @Input() set result(fightResult: FightResultModel) {
    if (fightResult) {
      this.fightResult = fightResult;
      this.victory = !!fightResult.player;
      if (this.victory) {
        if (fightResult.loot) {
          setTimeout(() => {
            party.confetti(this.loot.nativeElement, {
              count: party.variation.range(20, 40),
            });
          });
        }
        this.store.dispatch(new UpdatePlayer(fightResult.player));
      }
    }
  }

  public getItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 62.5;
    }
    return 125;
  }
}
