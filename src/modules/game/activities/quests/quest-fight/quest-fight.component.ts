import { Component, EventEmitter, Output, inject } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { Store } from '@ngxs/store';
import { MainState } from 'src/store/main.store';
import { ViewportService } from 'src/services/viewport.service';
import { FightService } from 'src/services/fight.service';
import {
  FightModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { take } from 'rxjs';
import { QuestModel } from 'src/modules/core/models/quest.model';

@Component({
  selector: 'app-quest-fight',
  templateUrl: './quest-fight.component.html',
  styleUrl: './quest-fight.component.scss',
})
export class QuestFightComponent extends TemplatePage {
  private store = inject(Store);
  private viewportService = inject(ViewportService);
  fightService = inject(FightService);
  turnActions = TurnActionEnum;
  @Output() questStatusChange = new EventEmitter<QuestStatusEnum>();
  player: PlayerModel = this.store.selectSnapshot(MainState.getState).player;
  quest: QuestModel = this.store
    .selectSnapshot(MainState.getState)
    .quests.find((quest) => quest.startedAt !== null);
  fight: FightModel;

  constructor() {
    super();

    this.fightService
      .start()
      .pipe(take(1))
      .subscribe((fight) => (this.fight = fight));
  }

  doAction(action: TurnActionEnum) {
    this.fightService
      .actions(action)
      .pipe(take(1))
      .subscribe((fight) => (this.fight = fight));
  }

  getHealthBarHeight() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 50;
      case 'md':
        return 40;
      case 'xs':
      case 'sm':
      default:
        return 30;
    }
  }

  getButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 'btn-lg';
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 'btn-md';
    }
  }
}
