import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  FightModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { PlayerStatsModel } from 'src/modules/core/models/player-stats.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { animateElement } from 'src/modules/utils';
import { FightService } from 'src/services/fight.service';
import { ViewportService } from 'src/services/viewport.service';
import { EndFight, MainState, StartFight } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';

@Component({
  selector: 'app-quest-fight',
  templateUrl: './quest-fight.component.html',
  styleUrl: './quest-fight.component.scss',
})
export class QuestFightComponent extends TemplatePage {
  turnActions = TurnActionEnum;
  player: PlayerModel = this.store.selectSnapshot(MainState.getState).player;
  quest: QuestModel = this.store
    .selectSnapshot(MainState.getState)
    .quests.find((quest) => quest.startedAt !== null);
  fight: FightModel;
  enemy: PlayerStatsModel;
  victory = false;
  defeat = false;
  private lastClickTime: number = 0;
  showPlayerAction = false;
  showEnemyAction = false;

  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();

  constructor(
    private store: Store,
    private viewportService: ViewportService,
    private fightService: FightService
  ) {
    super();

    this.fightService
      .get('/')
      .pipe(take(1))
      .subscribe({
        next: (fight) => {
          this.fight = fight;
          this.enemy = this.fight.enemyStats;
          this.store.dispatch(new StartFight(fight));
        },
        error: () => {
          this.questStatusChange.emit({ status: QuestStatusEnum.PICKING });
        },
      });
  }

  doAction(action: TurnActionEnum) {
    const currentTime = Date.now();

    if (currentTime - this.lastClickTime < 1000) {
      return;
    }
    this.lastClickTime = currentTime;

    this.fightService
      .actions(action)
      .pipe(take(1))
      .subscribe((fight) => {
        const victory = fight.enemyStats.health === 0;
        const defeat = fight.playerStats.health === 0;

        this.controlTurnActions(fight);
        if (victory || defeat) {
          victory ? this.triggerVictory(fight) : this.triggerDefeat(fight);
        }

        this.fight = fight;
      });
  }

  private controlTurnActions(fight: FightModel) {
    const lastTurn = fight.turns[fight.turns.length - 1];
    const lastPlayerAction = lastTurn.playerTurn.action;
    const lastEnemyAction = lastTurn.enemyTurn.action;
    if (lastPlayerAction === TurnActionEnum.ATTACK) {
      animateElement('.player-image', 'fadeOutRightBig');
    }
    if (lastEnemyAction === TurnActionEnum.ATTACK) {
      animateElement('.enemy-image', 'fadeOutLeftBig');
    }
    if (lastPlayerAction === TurnActionEnum.DEFEND) {
      animateElement('.player-image', 'rotateInUpLeft');
    }
    if (lastEnemyAction === TurnActionEnum.DEFEND) {
      animateElement('.enemy-image', 'rotateInUpRight');
    }
    if (
      lastPlayerAction === TurnActionEnum.BLOCK ||
      lastPlayerAction === TurnActionEnum.CRIT ||
      lastPlayerAction === TurnActionEnum.MISS
    ) {
      this.showPlayerAction = true;
      setTimeout(() => {
        this.showPlayerAction = false;
      }, 1000);
    }

    if (
      lastEnemyAction === TurnActionEnum.BLOCK ||
      lastEnemyAction === TurnActionEnum.CRIT ||
      lastEnemyAction === TurnActionEnum.MISS
    ) {
      this.showEnemyAction = true;
      setTimeout(() => {
        this.showEnemyAction = false;
      }, 1000);
    }
  }

  private triggerVictory(fight: FightModel) {
    animateElement('.player-image', 'pulse');
    animateElement('.enemy-image', 'hinge', () => {
      this.victory = true;
      this.store.dispatch(new EndFight());
      setTimeout(() => {
        animateElement('.finish-quest-screen', 'jackInTheBox');
        setTimeout(() => {
          this.questStatusChange.emit({
            status: QuestStatusEnum.RESULT,
            data: fight.result,
          });
        }, 1500);
      });
    });
  }

  private triggerDefeat(fight: FightModel) {
    animateElement('.enemy-image', 'pulse');
    animateElement('.player-image', 'hinge', () => {
      this.defeat = true;
      this.store.dispatch(new EndFight());
      setTimeout(() => {
        animateElement('.defeat-title', 'jackInTheBox');
        setTimeout(() => {
          this.questStatusChange.emit({
            status: QuestStatusEnum.RESULT,
            data: fight.result,
          });
        }, 1500);
      });
    });
  }

  getHealthBarHeight() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 50;
      case 'md':
        return 40;
      case 'xs':
      case 'sm':
      default:
        return 30;
    }
  }

  getHealthEnergyHeight() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 40;
      case 'md':
        return 30;
      case 'xs':
      case 'sm':
      default:
        return 20;
    }
  }

  getButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 'btn-lg';
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 'btn-md';
    }
  }
}
