import { Component, OnDestroy } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { RarityEnum } from 'src/modules/core/models/items.enum';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { getRarityColor } from 'src/modules/utils';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
})
export class QuestsComponent extends TemplatePage implements OnDestroy {
  getRarityColor = getRarityColor;
  quests: QuestModel[] = [
    {
      id: 0,
      userId: '',
      name: 'Cleaning the sewers',
      description: 'Kill some rats',
      image:
        'https://img.freepik.com/premium-photo/fantastic-epic-magical-landscape-mountains-summer-nature-mystic-forest-gaming-rpg-background_636456-2552.jpg',
      level: 1,
      rarity: RarityEnum.COMMON,
      startedAt: '2024-01-14T23:15:14.059Z',
      finishedAt: '2024-01-14T23:50:14.059Z',
      claimed: false,
      completed: false,
    },
    {
      id: 0,
      userId: '',
      name: 'Bring me back my hat',
      description: 'A cat stole my hat',
      image: '',
      level: 1,
      rarity: RarityEnum.UNCOMMON,
      startedAt: '',
      finishedAt: '',
      claimed: false,
      completed: false,
    },
    {
      id: 0,
      userId: '',
      name: 'Conquer Africa',
      description: 'We wuz kangz and shiet',
      image: '',
      level: 1,
      rarity: RarityEnum.EPIC,
      startedAt: '',
      finishedAt: '',
      claimed: false,
      completed: false,
    },
  ];
  activeQuest: QuestModel = this.quests[0];
  percentageCompletion: number;
  timeCompletion: number;
  interval;

  constructor() {
    super();

    this.interval = setInterval(() => {
      const startedAt = new Date(this.activeQuest.startedAt);
      const finishedAt = new Date(this.activeQuest.finishedAt);
      const currentDate = new Date();

      const timeDifferenceMinutes =
        (currentDate.getTime() - startedAt.getTime()) / (1000 * 60);

      const totalTimeSpanMinutes =
        (finishedAt.getTime() - startedAt.getTime()) / (1000 * 60);

      this.timeCompletion =
        Math.round((-timeDifferenceMinutes / 6) * 100) / 100;

      this.percentageCompletion =
        -(timeDifferenceMinutes / totalTimeSpanMinutes) * 100;

      console.log(this.percentageCompletion);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
