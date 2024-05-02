import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
  EventEmitter,
  Output,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { FightResultModel } from 'src/modules/core/models/fight.model';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer, SetQuests } from 'src/store/main.store';
import * as party from 'party-js';
import { QuestService } from 'src/services/quest.service';
import { take } from 'rxjs';
import { QuestRouterModel } from '../models/quest-router.model';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-quest-result',
  templateUrl: './quest-result.component.html',
  styleUrl: './quest-result.component.scss',
})
export class QuestResultComponent extends TemplatePage {
  @ViewChild('lootItem', { read: ElementRef }) loot: ElementRef;
  @ViewChild('levelUp', { read: ElementRef }) levelUp: ElementRef;
  fightResult: FightResultModel;
  store = inject(Store);
  viewportService = inject(ViewportService);
  questService = inject(QuestService);
  titleService = inject(Title);
  victory = false;
  questStatusEnum = QuestStatusEnum;
  player = this.store.selectSnapshot(MainState.getState).player;
  getRarityColor = getRarityColor;

  constructor() {
    super();
    this.titleService.setTitle('Quest result');
  }

  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();
  @Input() set result(fightResult: FightResultModel) {
    if (fightResult) {
      this.fightResult = fightResult;
      this.victory = !!fightResult.player;
      this.updateQuests();
      if (this.victory) {
        if (fightResult.loot && (!fightResult.lostLoot || fightResult.lostLoot.length == 0)) {
          setTimeout(() => {
            party.confetti(this.loot.nativeElement, {
              count: party.variation.range(20, 40),
            });
          });
        }
        if (fightResult.player?.level > this.player.level) {
          setTimeout(() => {
            party.sparkles(this.levelUp.nativeElement, {
              count: party.variation.range(20, 40),
            });
          });
        }
        this.store.dispatch(new RefreshPlayer());
      }
    }
  }

  private updateQuests() {
    this.questService
      .getActive()
      .pipe(take(1))
      .subscribe((quests) => this.store.dispatch(new SetQuests(quests)));
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
