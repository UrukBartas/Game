import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { take } from 'rxjs';
import {
  FightModel,
  FightResultModel,
} from 'src/modules/core/models/fight.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { FightService } from 'src/services/fight.service';
import { MainState, StartFight } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';

@Component({
  selector: 'app-quest-fight',
  templateUrl: './quest-fight.component.html',
  styleUrls: ['./quest-fight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuestFightComponent implements OnInit {
  quest: QuestModel = this.store
    .selectSnapshot(MainState.getState)
    .quests.find((quest) => quest.startedAt !== null);
  fightBackgroundImage = this.getBackground();
  player: PlayerModel = this.store.selectSnapshot(MainState.getPlayer);
  fight: FightModel;

  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();

  constructor(
    private store: Store,
    private fightService: FightService
  ) {}

  ngOnInit() {
    this.fightService
      .get('/')
      .pipe(take(1))
      .subscribe({
        next: (fight) => {
          this.fight = fight;
          this.store.dispatch(new StartFight(fight));
        },
        error: () => {
          this.questStatusChange.emit({ status: QuestStatusEnum.PICKING });
        },
      });
  }

  onActionSubmitted(event) {
    const { action, consumableId } = event;
    this.fightService
      .actions(action, consumableId)
      .pipe(take(1))
      .subscribe((fight) => {
        this.fight = fight;
      });
  }

  onVictory(result: FightResultModel): void {
    this.questStatusChange.emit({
      status: QuestStatusEnum.RESULT,
      data: result,
    });
  }

  onDefeat(result: FightResultModel): void {
    this.questStatusChange.emit({
      status: QuestStatusEnum.RESULT,
      data: result,
    });
  }

  onSurrender(): void {
    this.fightService
      .surrender()
      .pipe(take(1))
      .subscribe((quest) => this.triggerDefeat({ newQuest: quest }));
  }

  getBackground(): string {
    return this.quest.data.backgroundImage;
  }
}
