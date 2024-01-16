import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { ViewportService } from 'src/services/viewport.service';
import { EndQuest, MainState } from 'src/store/main.store';

@Component({
  selector: 'app-active-quest',
  templateUrl: './active-quest.component.html',
  styleUrl: './active-quest.component.scss',
})
export class ActiveQuestComponent extends TemplatePage implements OnDestroy {
  quest: QuestModel;
  percentage: number;
  time: string;
  interval;

  constructor(
    public viewportService: ViewportService,
    private store: Store
  ) {
    super();
    this.quest = this.store.selectSnapshot(MainState.getState).activeQuest;
    this.store.dispatch(new EndQuest());

    if (this.quest) {
      this.setQuestTimer();
    }
  }

  setQuestTimer() {
    const finishedAt = new Date(new Date().getTime() + 5 * 60000);
    const startedAt = new Date(new Date().getTime() - 2 * 60000);
    this.interval = setInterval(() => {
      /* const startedAt = new Date(this.quest.startedAt);
      const finishedAt = new Date(this.quest.finishedAt); */
      const currentDate = new Date();

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

      console.log(this.percentage);
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

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
