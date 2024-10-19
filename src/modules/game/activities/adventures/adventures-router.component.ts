import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { cloneDeep } from 'lodash-es';
import { take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestModel } from 'src/modules/core/models/quest.model';
import {
  AdventureData,
  AdventuresDataService,
} from 'src/services/adventures-data.service';
import { Adventure, AdventuresService } from 'src/services/adventures.service';
import { QuestService } from 'src/services/quest.service';
import { ViewportService } from 'src/services/viewport.service';
import { SetQuests } from 'src/store/main.store';
import { QuestRouterModel } from '../quests/models/quest-router.model';
import { environment } from 'src/environments/environment';

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
          (questPickChanged)="questPickChanged.emit($event)"
          (statusChanged)="statusChangedQuest($event)"
        ></app-quest-router>
      }
      @case (adventureStateEnum.FINISHED) {
        <div
          class="d-flex justify-content-center align-items-center flex-column h-100"
        >
          <span class="text-white" urSubtitle>Good job!</span>
          <span class="text-third" urTitle>
            {{ selectedAdventure.name }} is completed!</span
          >
          <img
            [src]="imagePrefix + '/assets/misc/opened_chest.png'"
            [ngStyle]="{
              height: viewportService.getResponsiveSizeChestImg()[1] + 'px',
              width: viewportService.getResponsiveSizeChestImg()[0] + 'px'
            }"
          />
          <span class="text-white" urText>Rewards harvested</span>
          <button class="btn btn-primary" (click)="goNextAdventure.emit()">
            <i class="fa fa-arrow-left px-2 pb-1"></i>Continue to next adventure
          </button>
        </div>
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
  viewportService = inject(ViewportService);
  imagePrefix = environment.permaLinkImgPref;

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
  @Output() questStatusChanged = new EventEmitter<QuestRouterModel>();
  @Output() questPickChanged = new EventEmitter<QuestModel>();
  @Output() goNextAdventure = new EventEmitter<void>();

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
    this.questStatusChanged.emit(router);
    if (!!router.force) this.updateAdventures.emit();
  }
}
