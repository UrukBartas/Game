import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject, take } from 'rxjs';
import {
  BaseFightModel,
  FightTypes,
} from 'src/modules/core/components/base-fight/models/base-fight.model';
import {
  FightModel,
  FightResultModel,
} from 'src/modules/core/models/fight.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { FightService } from 'src/services/fight.service';
import { MainState, StartFight } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';
import { getIRIFromCurrentPlayer } from 'src/modules/utils';

@Component({
  selector: 'app-quest-fight',
  templateUrl: './quest-fight.component.html',
  styleUrls: ['./quest-fight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuestFightComponent implements OnInit {
  private store = inject(Store);
  private fightService = inject(FightService);
  fight$ = new Subject<BaseFightModel>();
  triggerDefeat$ = new Subject<{ newQuest: QuestModel }>();
  fightType = FightTypes.QUEST;
  quest: QuestModel = this.store
    .selectSnapshot(MainState.getState)
    .quests.find((quest) => quest.startedAt !== null);
  player = this.store.selectSnapshot(MainState.getPlayer);

  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();

  ngOnInit() {
    this.fightService
      .get('/')
      .pipe(take(1))
      .subscribe({
        next: (fight: FightModel) => {
          this.fight$.next(this.adaptFight(fight, true));
          this.store.dispatch(new StartFight(this.fightType));
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
        this.fight$.next(this.adaptFight(fight, false));
      });
  }

  private adaptFight(fight: FightModel, load: boolean): BaseFightModel {
    const lastTurn = fight.turns[fight.turns?.length - 1];
    return {
      load,
      player: {
        name: this.player.name,
        image: this.player.image,
        level: this.player.level,
        title: this.player.title,
        iri: getIRIFromCurrentPlayer(this.player),
        baseStats: fight.baseStats.player,
        currentStats: fight.currentStats.player,
        lastTurn: lastTurn?.playerTurn,
      },
      enemy: {
        name: this.quest.data.enemy,
        image: this.quest.data.enemyImage,
        level: this.quest.level,
        title: '',
        iri: 0,
        baseStats: fight.baseStats.enemy,
        currentStats: fight.currentStats.enemy,
        lastTurn: lastTurn?.enemyTurn,
      },
      turns: fight.turns,
      result: fight.result,
    };
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
      .subscribe((quest) => this.triggerDefeat$.next({ newQuest: quest }));
  }

  getBackground(): string {
    return this.quest?.data?.backgroundImage;
  }
}
