import {
  Component,
  EventEmitter,
  Input,
  Output,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { MainState } from 'src/store/main.store';
import { QuestStatusEnum } from './enums/quest-status.enum';
import { QuestRouterModel } from './models/quest-router.model';
import { AdventureData } from 'src/services/adventures-data.service';
import { cloneDeep } from 'lodash-es';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { QuestService } from 'src/services/quest.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quest-router',
  template: `
    <ng-container [ngSwitch]="questRouter().status">
      <app-quest-picker
        [adventure]="adventure"
        *ngSwitchCase="questStatusEnum.PICKING"
        (questStatusChange)="questRouter.set($event)"
        (questChanged)="questPickChanged.emit($event)"
      ></app-quest-picker>
      <app-quest-progress
        *ngSwitchCase="questStatusEnum.IN_PROGRESS"
        (questStatusChange)="questProgressStatusChange($event)"
      ></app-quest-progress>
      <app-quest-fight
        *ngSwitchCase="questStatusEnum.FIGHT"
        (questStatusChange)="questRouter.set($event)"
      ></app-quest-fight>
      <app-quest-result
        *ngSwitchCase="questStatusEnum.RESULT"
        [result]="questRouter().data"
        (questStatusChange)="questRouter.set($event)"
      ></app-quest-result>
    </ng-container>
  `,
})
export class QuestRouterComponent extends TemplatePage {
  questStatusEnum = QuestStatusEnum;
  questService = inject(QuestService);
  questRouter = signal<QuestRouterModel>({ status: QuestStatusEnum.PICKING });
  questRouterEffect = effect(() => {
    this.statusChanged.emit(this.questRouter());
  });
  @Output() questPickChanged = new EventEmitter<QuestModel>();
  @Input() public set adventure(data: AdventureData) {
    this._data = cloneDeep(data);
    if (!this._data || this._data.id != data.id) this.getQuestStatus();
  }
  public get adventure() {
    return this._data;
  }

  @Output() statusChanged = new EventEmitter<QuestRouterModel>();

  private _data: AdventureData;
  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.getQuestStatus();
  }

  public async questProgressStatusChange(event: QuestRouterModel) {
    if (!!event.data) {
      const quest = event.data as QuestModel;
      const isPassiveQuest = quest.data.type == 'Passive';
      if (isPassiveQuest) {
        const result = await firstValueFrom(
          this.questService.resolve(quest.id)
        );
        this.questRouter.set({
          status: QuestStatusEnum.RESULT,
          data: result.result,
        });
      } else {
        this.questRouter.set(event);
      }
    } else {
      this.questRouter.set(event);
    }
  }

  private getQuestStatus() {
    let quests = this.store.selectSnapshot(MainState.getState).quests ?? [];
    let activeQuest = null;
    if (this.adventure) {
      quests = this.adventure?.Adventure[0]?.quests ?? [];
      activeQuest = quests.find(
        (quest) =>
          this.adventure.Adventure[0].currentPhase + 1 == quest.data.phase &&
          quest.startedAt !== null
      );
    } else {
      quests = quests.filter(
        (entry) =>
          (!entry.adventures || entry.adventures.length == 0) &&
          !entry.data.isAdventurePhase
      );
      activeQuest = quests.find((quest) => quest.startedAt !== null);
    }

    const activeFight = this.store.selectSnapshot(MainState.getState).fight;
    if (activeQuest) {
      if (!activeFight) {
        this.questRouter().status = QuestStatusEnum.IN_PROGRESS;
      } else {
        this.questRouter().status = QuestStatusEnum.FIGHT;
      }
    } else {
      this.questRouter().status = QuestStatusEnum.PICKING;
    }
  }
}
