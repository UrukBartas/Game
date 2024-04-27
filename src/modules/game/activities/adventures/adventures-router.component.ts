import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  AdventureData,
  AdventuresDataService,
} from 'src/services/adventures-data.service';
import { Adventure, AdventuresService } from 'src/services/adventures.service';
import { QuestStatusEnum } from '../quests/enums/quest-status.enum';
import { QuestRouterModel } from '../quests/models/quest-router.model';
import { cloneDeep } from 'lodash';
export enum AdventureState {
  NON_STARTED,
  STARTED,
  FINISHED,
}
@Component({
  selector: 'app-adventure-router',
  template: `
    @switch (adventureState) {
      @case (adventureStateEnum.STARTED) {
        <!-- @if (questRouter == questStatusEnum.PICKING) {
          <app-quest-picker></app-quest-picker>
        } @else if (questRouter == questStatusEnum.IN_PROGRESS) {
          <app-quest-progress></app-quest-progress>
        } @else {
          AH
        } -->
        <app-quest-router [adventure]="selectedAdventure"></app-quest-router>
      }
      @default {
        <app-adventure-picker
          (onStartedAdventure)="onAdventureStarted.emit($event)"
          [selectedAdventure]="selectedAdventure"
        ></app-adventure-picker>
      }
    }

    <!-- <ng-container [ngSwitch]="questRouter.status">
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
    </ng-container> -->
  `,
})
export class AdventuresRouterComponent extends TemplatePage {
  adventureService = inject(AdventuresService);
  adventureDataService = inject(AdventuresDataService);

  @Input() public set selectedAdventure(data: AdventureData) {
    this._selectedAdventure = cloneDeep(data);
    console.log(data)
    this.adventureState = AdventureState.NON_STARTED;
    if (data.Adventure.length > 0) {
      this.adventureState = AdventureState.STARTED;
      // const quests = data.Adventure[0].quests;
      // const activeQuest = quests.find((quest) => quest.startedAt !== null);
      // if (activeQuest) this.questRouter = QuestStatusEnum.IN_PROGRESS;
    }
  }
  public get selectedAdventure() {
    return this._selectedAdventure;
  }

  @Output() onAdventureStarted = new EventEmitter<Adventure>();

  private _selectedAdventure: AdventureData;
  public adventureState: AdventureState = AdventureState.NON_STARTED;
  public adventureStateEnum = AdventureState;
  // questStatusEnum = QuestStatusEnum;
  // questRouter: QuestStatusEnum = QuestStatusEnum.PICKING;

  constructor(private store: Store) {
    super();
  }
}
