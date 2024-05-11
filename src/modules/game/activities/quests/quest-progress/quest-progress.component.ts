import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Adventure } from 'src/services/adventures.service';
import { filter } from 'rxjs';

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
    private store: Store,
    private ngZone: NgZone,
    private title: Title
  ) {
    super();
  }

  ngOnInit(): void {
    this.store
      .select(MainState.getState)
      .pipe(filter((entry) => !!entry.quests))
      .subscribe((state) => {
        this.quest = state.quests.find((quest) => quest.startedAt !== null);
        if (this.quest) {
          this.setQuestTimer();
        }
      });
  }

  changeTitleRecursiveQuestIsReady(): void {
    if (!this.questReady) return;
    this.title.setTitle('Quest Ready!');
    setTimeout(() => {
      this.title.setTitle('Battle Incoming!');
      setTimeout(() => {
        this.changeTitleRecursiveQuestIsReady();
      }, 1000);
    }, 1000);
  }

  setQuestTimer() {
    this.ngZone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        if (!this.quest) {
          clearInterval(this.interval);
          return;
        }
        const startedAt = new Date(this.quest.startedAt);
        const finishedAt = new Date(this.quest.finishedAt);
        //finishedAt.setMinutes(finishedAt.getMinutes() - 320);
        const currentDate = new Date();

        if (currentDate > finishedAt) {
          clearInterval(this.interval);
          this.ngZone.run(() => {
            this.questReady = true;
            this.changeTitleRecursiveQuestIsReady();
          });
        }

        const totalTimeSpanMillis = finishedAt.getTime() - startedAt.getTime();
        const totalTimeDifferenceMillis =
          totalTimeSpanMillis - (currentDate.getTime() - startedAt.getTime());
        const timeDifferenceMillis =
          currentDate.getTime() - startedAt.getTime();

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
        this.title.setTitle(`${this.time} - ${this.quest.data.name}`);
        this.ngZone.run(() => {
          this.time = formattedTime;
          this.percentage = (timeDifferenceMillis / totalTimeSpanMillis) * 100;
        });
      }, 100);
    });
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

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.questReady = false;
  }
}
