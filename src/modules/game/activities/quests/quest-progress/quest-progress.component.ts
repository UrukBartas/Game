import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';

@Component({
  selector: 'app-quest-progress',
  templateUrl: './quest-progress.component.html',
  styleUrl: './quest-progress.component.scss',
})
export class QuestProgressComponent extends TemplatePage implements OnDestroy {
  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();

  quest: QuestModel;
  questReady = false;
  questStatusEnum = QuestStatusEnum;
  percentage: number;
  time: string;
  interval;

  constructor(
    public viewportService: ViewportService,
    private store: Store
  ) {
    super();
    this.quest = this.store
      .selectSnapshot(MainState.getState)
      .quests.find((quest) => quest.startedAt !== null);

    if (this.quest) {
      this.setQuestTimer();
    }
  }

  setQuestTimer() {
    this.interval = setInterval(() => {
      const startedAt = new Date(this.quest.startedAt);
      const finishedAt = new Date(this.quest.finishedAt);
      finishedAt.setMinutes(finishedAt.getMinutes() - 30);
      const currentDate = new Date();

      if (currentDate > finishedAt) {
        clearInterval(this.interval);
        this.questReady = true;
      }

      const totalTimeSpanMillis = finishedAt.getTime() - startedAt.getTime();
      const totalTimeDifferenceMillis =
        totalTimeSpanMillis - (currentDate.getTime() - startedAt.getTime());
      const timeDifferenceMillis = currentDate.getTime() - startedAt.getTime();

      const hours: number = Math.floor(totalTimeDifferenceMillis / 3600000);
      const minutes: number = Math.floor(
        (totalTimeDifferenceMillis % 3600000) / 60000
      );
      const seconds: number = Math.floor(
        (totalTimeDifferenceMillis % 60000) / 1000
      );

      const formattedTime = `${String(hours).padStart(2, '0')}:${String(
        minutes
      ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      this.time = formattedTime;
      this.percentage = (timeDifferenceMillis / totalTimeSpanMillis) * 100;
    }, 50);
  }

  getProgressBarHeight() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 30;
      case 'md':
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

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
