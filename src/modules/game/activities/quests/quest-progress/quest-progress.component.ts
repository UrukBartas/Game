import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { filter, Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { QuestTimerService } from 'src/services/quest-timer.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';
import { PlayerModel } from 'src/modules/core/models/player.model';

@Component({
  selector: 'app-quest-progress',
  templateUrl: './quest-progress.component.html',
  styleUrl: './quest-progress.component.scss',
})
export class QuestProgressComponent extends TemplatePage {
  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();
  questTimerService = inject(QuestTimerService);
  quest: QuestModel;
  questStarted = false;
  @Select(MainState.getPlayer) player$: Observable<PlayerModel>;
  public prefix = environment.permaLinkImgPref;
  
  constructor(
    public viewportService: ViewportService,
    private store: Store
  ) {
    super();
  }

  ngOnInit(): void {
    this.store
      .select(MainState.getState)
      .pipe(
        filter((entry) => !!entry.quests),
        take(1)
      )
      .subscribe((state) => {
        this.quest = state.quests.find((quest) => quest.startedAt !== null);
      });
  }

  startQuest() {
    this.questStarted = true;
    this.questStatusChange.emit({
      data: this.quest,
      status: QuestStatusEnum.FIGHT,
    });
  }

  public getEquippedItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 70;
    }
    return 140;
  }

  getProgressBarHeight() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 40;
      case 'md':
        return 30;
      case 'xs':
      case 'sm':
      default:
        return 20;
    }
  }

  getResponsiveButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return '0.8em 3em';
      case 'md':
        return '0.4em 1.5em';
      case 'xs':
      case 'sm':
      default:
        return '0.3em 1em';
    }
  }

  getResponsiveButtonFontSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
        return 'calc(1.325rem + 0.9vw)';
      case 'xl':
      case 'lg':
        return 'calc(1.3rem + 0.6vw)';
      case 'md':
        return 'calc(1.275rem + 0.3vw)';
      case 'xs':
      case 'sm':
      default:
        return '3.25rem';
    }
  }
}
