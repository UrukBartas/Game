import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { RarityEnum } from 'src/modules/core/models/items.enum';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, StartQuest } from 'src/store/main.store';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
  animations: [
    trigger('carouselAnimation', [
      state(
        'hidden',
        style({
          display: 'none',
          opacity: 0,
        })
      ),
      state(
        'visible',
        style({
          display: 'block',
          opacity: 1,
        })
      ),
      transition('hidden => visible', animate('300ms ease-in')),
      transition('visible => hidden', animate('300ms ease-out')),
    ]),
  ],
})
export class QuestsComponent extends TemplatePage {
  quests: QuestModel[] = [
    {
      id: 0,
      userId: '',
      name: 'Cleaning the sewers',
      description:
        'Rats are becoming a plague in the city, kill as many as you can.',
      image: '/assets/quests/1.png',
      level: 1,
      rarity: RarityEnum.COMMON,
      startedAt: '2024-01-14T23:15:14.059Z',
      finishedAt: '2024-01-14T23:50:14.059Z',
      claimed: false,
      completed: false,
      selected: true,
    },
    {
      id: 1,
      userId: '',
      name: 'We need meat for the winter',
      description:
        'The winter is around the corner and we are running low on food. Kill some wildboars.',
      image: '/assets/quests/2.png',
      level: 1,
      rarity: RarityEnum.UNCOMMON,
      startedAt: '',
      finishedAt: '',
      claimed: false,
      completed: false,
    },
    {
      id: 2,
      userId: '',
      name: 'Defeat the crazy homeless',
      description:
        'A crazy man is causing problems at the village. Take care of it.',
      image: '/assets/quests/3.png',
      level: 1,
      rarity: RarityEnum.EPIC,
      startedAt: '',
      finishedAt: '',
      claimed: false,
      completed: false,
    },
  ];

  activeQuest = false;
  getRarityColor = getRarityColor;
  currentIndex = 0;
  nextIndex = 1;
  prevIndex = this.quests.length - 1;

  constructor(
    private store: Store,
    public viewportService: ViewportService
  ) {
    super();
    const { activeQuest } = this.store.selectSnapshot(MainState.getState);
    if (activeQuest) {
      this.activeQuest = true;
    } else {
      this.getUserQuests();
    }
  }

  getUserQuests() {
    // TODO
  }

  prevQuest() {
    this.nextIndex = this.currentIndex;
    this.currentIndex = this.prevIndex;
    this.prevIndex =
      (this.prevIndex - 1 + this.quests.length) % this.quests.length;

    console.log(this.prevIndex);
    console.log(this.currentIndex);
    console.log(this.nextIndex);
  }

  nextQuest() {
    this.prevIndex = this.currentIndex;
    this.currentIndex = this.nextIndex;
    this.nextIndex = (this.nextIndex + 1) % this.quests.length;

    console.log(this.prevIndex);
    console.log(this.currentIndex);
    console.log(this.nextIndex);
  }

  startQuest() {
    const quest = this.quests.find((quest) => quest.selected);
    this.store.dispatch(new StartQuest(quest));
    this.activeQuest = true;
  }
}
