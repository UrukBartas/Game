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
import { QuestService } from 'src/services/quest.service';
import { take } from 'rxjs';
import { SetQuests } from 'src/store/main.store';
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
        <app-quest-router
          [adventure]="selectedAdventure"
          (statusChanged)="statusChangedQuest($event)"
        ></app-quest-router>
      }
      @case (adventureStateEnum.FINISHED) {
        <span class="text-white">
          {{ selectedAdventure.name }} is completed!</span
        >
      }
      @default {
        <app-adventure-picker
          (onStartedAdventure)="onAdventureStarted.emit($event)"
          [selectedAdventure]="selectedAdventure"
        ></app-adventure-picker>
      }
    }
  `,
})
export class AdventuresRouterComponent extends TemplatePage {
  adventureService = inject(AdventuresService);
  adventureDataService = inject(AdventuresDataService);
  questService = inject(QuestService);
  store = inject(Store);

  @Input() public set selectedAdventure(data: AdventureData) {
    this._selectedAdventure = cloneDeep(data);
    this.adventureState = AdventureState.NON_STARTED;
    if (data.Adventure.length > 0 && !data.Adventure[0].completed) {
      this.adventureState = AdventureState.STARTED;
    }
    if (data.Adventure.length > 0 && !!data.Adventure[0].completed) {
      this.adventureState = AdventureState.FINISHED;
    }
  }
  public get selectedAdventure() {
    return this._selectedAdventure;
  }

  @Output() onAdventureStarted = new EventEmitter<Adventure>();
  @Output() updateAdventures = new EventEmitter<void>();

  private _selectedAdventure: AdventureData;
  public adventureState: AdventureState = AdventureState.NON_STARTED;
  public adventureStateEnum = AdventureState;

  constructor() {
    super();
    this.questService
      .getActive()
      .pipe(take(1))
      .subscribe((quests) => {
        this.store.dispatch(new SetQuests(quests));
      });
  }

  public statusChangedQuest(router: QuestRouterModel) {
    if (router.status == QuestStatusEnum.PICKING) {
      this.updateAdventures.emit();
    }
  }
}
