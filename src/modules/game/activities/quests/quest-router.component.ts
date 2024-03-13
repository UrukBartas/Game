import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { MainState } from 'src/store/main.store';
import { QuestStatusEnum } from './enums/quest-status.enum';
import { QuestRouterModel } from './models/quest-router.model';

@Component({
  selector: 'app-quest-router',
  template: `
    <ng-container [ngSwitch]="questRouter.status">
      <app-quest-picker
        *ngSwitchCase="questStatusEnum.PICKING"
        (questStatusChange)="questRouter = $event"
      ></app-quest-picker>
      <app-quest-progress
        *ngSwitchCase="questStatusEnum.IN_PROGRESS"
        (questStatusChange)="questRouter = $event"
      ></app-quest-progress>
      <app-quest-fight
        *ngSwitchCase="questStatusEnum.FIGHT"
        (questStatusChange)="questRouter = $event"
      ></app-quest-fight>
      <app-quest-result
        *ngSwitchCase="questStatusEnum.RESULT"
        [result]="questRouter.data"
        (questStatusChange)="questRouter = $event"
      ></app-quest-result>
    </ng-container>
  `,
})
export class QuestRouterComponent extends TemplatePage {
  questStatusEnum = QuestStatusEnum;
  questRouter: QuestRouterModel = { status: QuestStatusEnum.PICKING };

  constructor(private store: Store) {
    super();
    const quests = this.store.selectSnapshot(MainState.getState).quests ?? [];
    const activeQuest = quests.find((quest) => quest.startedAt !== null);
    const activeFight = this.store.selectSnapshot(MainState.getState).fight;

    if (activeQuest) {
      if (!activeFight) {
        this.questRouter.status = QuestStatusEnum.IN_PROGRESS;
      } else {
        this.questRouter.status = QuestStatusEnum.FIGHT;
      }
    } else {
      this.questRouter.status = QuestStatusEnum.PICKING;
    }
  }
}
