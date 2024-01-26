import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { getRarityColor } from 'src/modules/utils';
import { QuestService } from 'src/services/quest.service';
import { ViewportService } from 'src/services/viewport.service';
import { SetQuests } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';

@Component({
  selector: 'app-quest-picker',
  templateUrl: './quest-picker.component.html',
  styleUrl: './quest-picker.component.scss',
})
export class QuestPickerComponent extends TemplatePage {
  @Output() questStatusChange = new EventEmitter<QuestStatusEnum>();

  quests: QuestModel[];
  getRarityColor = getRarityColor;
  activeSlideIndex = 0;

  constructor(
    private store: Store,
    public viewportService: ViewportService,
    private questService: QuestService
  ) {
    super();
    this.getPlayerQuests();
  }

  getPlayerQuests() {
    this.questService
      .getActive()
      .pipe(take(1))
      .subscribe((quests) => {
        this.quests = quests;
        this.store.dispatch(new SetQuests(quests));
        if (quests.find((quest) => quest.startedAt !== null)) {
          this.questStatusChange.emit(QuestStatusEnum.IN_PROGRESS);
        }
      });
  }

  previousSlide() {
    if (this.activeSlideIndex > 0) {
      this.activeSlideIndex--;
      const carousel: HTMLElement = document.querySelector('.carousel');
      carousel.style.transform = `translateX(-${this.activeSlideIndex * 100}%)`;
    }
  }

  nextSlide() {
    if (this.activeSlideIndex < this.quests.length - 1) {
      this.activeSlideIndex++;
      const carousel: HTMLElement = document.querySelector('.carousel');
      carousel.style.transform = `translateX(-${this.activeSlideIndex * 100}%)`;
    }
  }

  startQuest() {
    this.questService
      .start(this.quests[this.activeSlideIndex].data.id)
      .subscribe(({ startedAt, finishedAt }) => {
        this.quests[this.activeSlideIndex].startedAt = startedAt;
        this.quests[this.activeSlideIndex].finishedAt = finishedAt;
        this.store.dispatch(new SetQuests(this.quests));
        this.questStatusChange.emit(QuestStatusEnum.IN_PROGRESS);
      });
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
}
