import { Injectable, NgZone, signal, WritableSignal } from '@angular/core';
import { Store } from '@ngxs/store';
import { interval, Subscription } from 'rxjs';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { MainState } from 'src/store/main.store';

@Injectable({
  providedIn: 'root',
})
export class QuestTimerService {
  private quest: QuestModel = null;
  private subscription: Subscription = null;

  time: WritableSignal<string> = signal(null);
  percentage: WritableSignal<number> = signal(null);

  constructor(
    private ngZone: NgZone,
    private store: Store
  ) {
    this.store
      .select(MainState.getState)
      .subscribe((state) => this.checkStartedQuests(state.quests));
  }

  private checkStartedQuests(quests: QuestModel[]): void {
    const startedQuest = quests?.find((quest) => quest.startedAt);
    if (startedQuest) {
      this.startTimer(startedQuest);
    } else {
      this.stopTimer();
    }
  }

  startTimer(quest: QuestModel): void {
    this.quest = quest;
    this.initSignals(quest);

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.ngZone.runOutsideAngular(() => {
      this.subscription = interval(1000).subscribe(() => {
        const time = this.getActiveQuestTime(this.quest);
        const percentage = this.getActiveQuestPercentage(this.quest);

        this.ngZone.run(() => {
          this.time.set(time);
          this.percentage.set(percentage);
        });
      });
    });
  }

  // to not wait the initial 1s
  initSignals(quest: QuestModel): void {
    const time = this.getActiveQuestTime(quest);
    const percentage = this.getActiveQuestPercentage(quest);
    this.time.set(time);
    this.percentage.set(percentage);
  }

  stopTimer(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.time.set(null);
      this.percentage.set(null);
    }
  }

  private getActiveQuestTime(quest: QuestModel): string | null {
    if (!quest) {
      return null;
    }

    const startedAt = new Date(quest.startedAt);
    const finishedAt = new Date(quest.finishedAt);
    const currentDate = new Date();

    const totalTimeSpanMillis = finishedAt.getTime() - startedAt.getTime();
    const totalTimeDifferenceMillis =
      totalTimeSpanMillis - (currentDate.getTime() - startedAt.getTime());

    if (totalTimeDifferenceMillis < 0) {
      return 'Ready';
    }

    const hours: number = Math.floor(totalTimeDifferenceMillis / 3600000);
    const minutes: number = Math.floor(
      (totalTimeDifferenceMillis % 3600000) / 60000
    );
    const seconds: number = Math.floor(
      (totalTimeDifferenceMillis % 60000) / 1000
    );

    if (hours < 1) {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private getActiveQuestPercentage(quest: QuestModel): number {
    const startedAt = new Date(quest.startedAt);
    const finishedAt = new Date(quest.finishedAt);
    const currentDate = new Date();
    const totalTimeSpanMillis = finishedAt.getTime() - startedAt.getTime();
    const timeDifferenceMillis = currentDate.getTime() - startedAt.getTime();

    return (timeDifferenceMillis / totalTimeSpanMillis) * 100;
  }
}
