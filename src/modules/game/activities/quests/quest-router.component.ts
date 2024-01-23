import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { MainState } from 'src/store/main.store';
import { QuestStatusEnum } from './enums/quest-status.enum';

@Component({
  selector: 'app-quest-router',
  template: `
    <ng-container [ngSwitch]="questStatus">
      <app-quest-picker
        *ngSwitchCase="questStatusEnum.PICKING"
        (questStatusChange)="questStatus = $event"
      ></app-quest-picker>
      <app-quest-progress
        *ngSwitchCase="questStatusEnum.IN_PROGRESS"
        (questStatusChange)="questStatus = $event"
      ></app-quest-progress>
      <app-quest-fight
        *ngSwitchCase="questStatusEnum.FIGHT"
        (questStatusChange)="questStatus = $event"
      ></app-quest-fight>
    </ng-container>
  `,
})
export class QuestRouterComponent extends TemplatePage {
  questStatusEnum = QuestStatusEnum;
  questStatus = QuestStatusEnum.PICKING;

  constructor(private store: Store) {
    super();
    const quests = this.store.selectSnapshot(MainState.getState).quests ?? [];
    const activeQuest = quests.find((quest) => quest.startedAt !== null);

    if (activeQuest) {
      if (!activeQuest.completed) {
        this.questStatus = QuestStatusEnum.IN_PROGRESS;
      } else {
        this.questStatus = QuestStatusEnum.FIGHT;
      }
    } else {
      this.questStatus = QuestStatusEnum.PICKING;
    }
  }
}
