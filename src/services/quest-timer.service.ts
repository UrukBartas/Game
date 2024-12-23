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
  totalTime: WritableSignal<string> = signal(null);
  reducedTime: WritableSignal<string> = signal(null);
  percentage: WritableSignal<number> = signal(null);
  reductionPercentage: WritableSignal<number> = signal(null);

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
        const reducedPercentage = this.getReductionPercentage();
        const adjustedPercentage = this.getActiveQuestPercentage(
          this.quest,
          reducedPercentage
        );
        const reducedTime = this.getReducedQuestTime(
          this.quest,
          reducedPercentage
        );
        const totalTime = this.getTotalQuestTime(this.quest);

        this.ngZone.run(() => {
          this.time.set(time);
          this.totalTime.set(totalTime);
          this.reducedTime.set(reducedTime);
          this.percentage.set(adjustedPercentage);
          this.reductionPercentage.set(reducedPercentage);
        });
      });
    });
  }

  initSignals(quest: QuestModel): void {
    const time = this.getActiveQuestTime(quest);
    const reducedPercentage = this.getReductionPercentage();
    const totalTime = this.getTotalQuestTime(this.quest);
    const adjustedPercentage = this.getActiveQuestPercentage(
      quest,
      reducedPercentage
    );
    const reducedTime = this.getReducedQuestTime(quest, reducedPercentage);

    this.time.set(time);
    this.totalTime.set(totalTime);
    this.reducedTime.set(reducedTime);
    this.percentage.set(adjustedPercentage);
    this.reductionPercentage.set(reducedPercentage);
  }

  stopTimer(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.time.set(null);
      this.totalTime.set(null);
      this.reducedTime.set(null);
      this.percentage.set(null);
      this.reductionPercentage.set(null);
    }
  }

  private getReductionPercentage(): number {
    const { boosts } = this.store.selectSnapshot(MainState.getPlayer);
    let reductionFactor = 0;

    boosts.forEach((boost) => {
      if (boost.type === 'TRAVEL') {
        reductionFactor += boost.boostData.value;
      }
    });

    return reductionFactor;
  }

  private getActiveQuestPercentage(
    quest: QuestModel,
    reducedPercentage: number
  ): number {
    const startedAt = new Date(quest.startedAt);
    const finishedAt = new Date(quest.finishedAt);
    const currentDate = new Date();

    const totalTimeSpanMillis = finishedAt.getTime() - startedAt.getTime();
    const timeElapsedMillis = currentDate.getTime() - startedAt.getTime();

    const elapsedTotalPercentage =
      (timeElapsedMillis / totalTimeSpanMillis) * 100;
    const adjustedPercentage =
      reducedPercentage +
      (elapsedTotalPercentage * (100 - reducedPercentage)) / 100;

    // Asegurarse de que no supere el 100%
    return Math.min(adjustedPercentage, 100);
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

    return this.formatTimeFromMillis(totalTimeDifferenceMillis);
  }

  private getReducedQuestTime(
    quest: QuestModel,
    reducedPercentage: number
  ): string {
    if (!quest) {
      return null;
    }

    const startedAt = new Date(quest.startedAt);
    const finishedAt = new Date(quest.finishedAt);

    const totalTimeSpanMillis = finishedAt.getTime() - startedAt.getTime();
    const reducedTimeSpanMillis =
      totalTimeSpanMillis * (reducedPercentage / 100);

    return this.formatTimeFromMillis(reducedTimeSpanMillis);
  }

  private getTotalQuestTime(quest: QuestModel): string {
    if (!quest) {
      return null;
    }

    const startedAt = new Date(quest.startedAt);
    const finishedAt = new Date(quest.finishedAt);
    const totalTimeSpanMillis = finishedAt.getTime() - startedAt.getTime();

    return this.formatTimeFromMillis(totalTimeSpanMillis);
  }

  private formatTimeFromMillis(milliseconds: number): string {
    const hours: number = Math.floor(milliseconds / 3600000);
    const minutes: number = Math.floor((milliseconds % 3600000) / 60000);
    const seconds: number = Math.floor((milliseconds % 60000) / 1000);

    if (hours < 1) {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}
