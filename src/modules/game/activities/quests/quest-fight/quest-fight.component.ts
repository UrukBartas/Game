import {
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  FightModel,
  FightResultModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { PlayerStatsModel } from 'src/modules/core/models/player-stats.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { animateElement } from 'src/modules/utils';
import { FightService } from 'src/services/fight.service';
import { ViewportService } from 'src/services/viewport.service';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { EndFight, MainState, StartFight } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';
import { Rarity } from 'src/modules/core/models/items.model';

@Component({
  selector: 'app-quest-fight',
  templateUrl: './quest-fight.component.html',
  styleUrl: './quest-fight.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class QuestFightComponent extends TemplatePage {
  turnActions = TurnActionEnum;
  player: PlayerModel = this.store.selectSnapshot(MainState.getState).player;
  quest: QuestModel = this.store
    .selectSnapshot(MainState.getState)
    .quests.find((quest) => quest.startedAt !== null);
  fight: FightModel;
  victory = false;
  defeat = false;
  private lastClickTime: number = 0;
  showPlayerAction = false;
  showEnemyAction = false;
  showReceivedPlayerDamage = false;
  showReceivedEnemyDamage = false;
  playerAnimation;
  enemyAnimation;
  fightBackgroundImage = this.getBackgroundByRarity();

  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();

  constructor(
    private store: Store,
    private viewportService: ViewportService,
    private fightService: FightService,
    private modalService: BsModalService
  ) {
    super();

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

  getBackgroundByRarity(): string {
    switch (this.quest.data.rarity) {
      case Rarity.COMMON:
      default:
        return '/assets/backgrounds/field.png';
      case Rarity.UNCOMMON:
        return '/assets/backgrounds/arena.png';
      case Rarity.EPIC:
        return '/assets/backgrounds/arena.png';
      case Rarity.LEGENDARY:
        return '/assets/backgrounds/arena.png';
      case Rarity.MYTHIC:
        return '/assets/backgrounds/arena.png';
    }
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
        const victory = fight.currentEnemyStats.health === 0;
        const defeat = fight.currentPlayerStats.health === 0;

        this.controlTurnActions(fight);
        if (victory || defeat) {
          victory
            ? this.triggerVictory(fight.result)
            : this.triggerDefeat(fight.result);
        }

        this.fight = fight;
      });
  }

  private controlTurnActions(fight: FightModel) {
    const lastTurn = fight.turns[fight.turns.length - 1];
    const lastPlayerAction = lastTurn.playerTurn.action;
    const lastEnemyAction = lastTurn.enemyTurn.action;
    if (
      lastPlayerAction === TurnActionEnum.ATTACK ||
      lastPlayerAction === TurnActionEnum.CRIT
    ) {
      this.handlePlayerAnimation('attack-right', 1);
      this.showReceivedEnemyDamage = true;
      setTimeout(() => {
        this.showReceivedEnemyDamage = false;
      }, 1000);
    }
    if (
      lastEnemyAction === TurnActionEnum.ATTACK ||
      lastEnemyAction === TurnActionEnum.CRIT
    ) {
      this.handleEnemyAnimation('attack-left', 1);
      if (lastTurn.enemyTurn.damage > 0) {
        this.showReceivedPlayerDamage = true;
        setTimeout(() => {
          this.showReceivedPlayerDamage = false;
        }, 1000);
      }
    }
    if (lastPlayerAction === TurnActionEnum.DEFEND) {
      this.handlePlayerAnimation('defend-right', 1);
    }
    if (lastEnemyAction === TurnActionEnum.DEFEND) {
      this.handleEnemyAnimation('defend-left', 1);
    }
    if (
      lastPlayerAction === TurnActionEnum.BLOCKED ||
      lastPlayerAction === TurnActionEnum.MISS
    ) {
      if (lastTurn.playerTurn.damage > 0) {
        this.showPlayerAction = true;
        setTimeout(() => {
          this.showPlayerAction = false;
        }, 1000);
      }
    }

    if (
      lastEnemyAction === TurnActionEnum.BLOCKED ||
      lastEnemyAction === TurnActionEnum.MISS
    ) {
      this.showEnemyAction = true;
      setTimeout(() => {
        this.showEnemyAction = false;
      }, 1000);
    }
  }

  private triggerVictory(result: FightResultModel) {
    animateElement('.player-image', 'pulse');
    animateElement('.enemy-image', 'hinge', () => {
      this.victory = true;
      this.store.dispatch(new EndFight());
      setTimeout(() => {
        animateElement('.finish-quest-screen', 'jackInTheBox');
        setTimeout(() => {
          this.questStatusChange.emit({
            status: QuestStatusEnum.RESULT,
            data: result,
          });
        }, 1500);
      });
    });
  }

  private triggerDefeat(result: FightResultModel) {
    animateElement('.enemy-image', 'pulse');
    animateElement('.player-image', 'hinge', () => {
      this.defeat = true;
      this.store.dispatch(new EndFight());
      setTimeout(() => {
        animateElement('.defeat-title', 'jackInTheBox');
        setTimeout(() => {
          this.questStatusChange.emit({
            status: QuestStatusEnum.RESULT,
            data: result,
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

  // duration in seconds
  private handlePlayerAnimation(animation: string, duration: number) {
    this.playerAnimation = `${animation} ${duration}s ease-in-out`;
    setTimeout(() => {
      this.playerAnimation = '';
    }, duration * 1000);
  }

  // duration in seconds
  private handleEnemyAnimation(animation: string, duration: number) {
    this.enemyAnimation = `${animation} ${duration}s`;
    setTimeout(() => {
      this.enemyAnimation = '';
    }, duration * 1000);
  }

  surrender() {
    const config: ModalOptions = {
      initialState: {
        title: 'Surrender',
        description: 'Do you want to surrender the fight?',
        accept: () => {
          this.fightService
            .surrender()
            .pipe(take(1))
            .subscribe((quest) => this.triggerDefeat({ newQuest: quest }));
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }
}
