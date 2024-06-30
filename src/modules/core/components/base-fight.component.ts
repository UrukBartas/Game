import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { QuestStatusEnum } from 'src/modules/game/activities/quests/enums/quest-status.enum';
import { QuestRouterModel } from 'src/modules/game/activities/quests/models/quest-router.model';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { ConsumableModalComponent } from 'src/modules/game/components/consumable-modal/consumable-modal.component';
import { animateElement } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { EndFight } from 'src/store/main.store';
import { BuffType } from '../models/fight-buff.model';
import {
  FighterTurnModel,
  FightModel,
  FightResultModel,
  TurnActionEnum,
} from '../models/fight.model';
import { TemplatePage } from './template-page.component';

@Component({
  template: '',
})
export abstract class BaseFightComponent extends TemplatePage {
  turnActions = TurnActionEnum;
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
  buffType = BuffType;
  isOpponent = false;

  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();

  constructor(
    protected store: Store,
    protected viewportService: ViewportService,
    protected modalService: BsModalService,
    protected cdr: ChangeDetectorRef
  ) {
    super();
  }

  abstract getBackground(): string;
  abstract submitAction(action: TurnActionEnum, consumableId?: number): void;
  abstract getTurn(): {
    playerTurn: FighterTurnModel;
    enemyTurn: FighterTurnModel;
  };
  abstract onSurrender(): void;
  abstract afterDefeat(result: FightResultModel): void;
  abstract afterVictory(result: FightResultModel): void;

  doAction(action: TurnActionEnum, consumableId?: number) {
    const currentTime = Date.now();

    if (currentTime - this.lastClickTime < 500 || this.fight.result) {
      return;
    }
    this.lastClickTime = currentTime;

    this.submitAction(action, consumableId);
  }

  onActionSubmited(fight: FightModel) {
    const { player, enemy } = fight.currentStats;

    this.controlTurnActions();

    const ripPlayer = player.health < 1;
    const ripEnemy = enemy.health < 1;

    if (ripPlayer || ripEnemy) {
      this.controlEndScreen(ripPlayer, fight.result);
    }
  }

  private controlEndScreen(ripPlayer: boolean, result: FightResultModel) {
    const victory =
      (this.isOpponent && ripPlayer) || (!this.isOpponent && !ripPlayer);
    victory ? this.triggerVictory(result) : this.triggerDefeat(result);
  }

  private controlTurnActions() {
    const { playerTurn, enemyTurn } = this.getTurn();
    const lastPlayerAction = playerTurn.action;
    const lastEnemyAction = enemyTurn.action;
    if (
      lastPlayerAction === TurnActionEnum.ATTACK ||
      lastPlayerAction === TurnActionEnum.CRIT
    ) {
      this.handlePlayerAnimation(
        this.viewportService.screenSize == 'xs' ? 'attack-up' : 'attack-right',
        1
      );
      this.showReceivedEnemyDamage = true;
      setTimeout(() => {
        this.showReceivedEnemyDamage = false;
      }, 1000);
    }
    if (
      lastEnemyAction === TurnActionEnum.ATTACK ||
      lastEnemyAction === TurnActionEnum.CRIT
    ) {
      this.handleEnemyAnimation(
        this.viewportService.screenSize == 'xs' ? 'attack-down' : 'attack-left',
        1
      );
      if (enemyTurn.damage > 0) {
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
    if (lastPlayerAction === TurnActionEnum.CHARGE) {
      this.handlePlayerAnimation('charge', 1);
    }
    if (lastEnemyAction === TurnActionEnum.CHARGE) {
      this.handleEnemyAnimation('charge', 1);
    }
    if (
      lastPlayerAction === TurnActionEnum.BLOCKED ||
      lastPlayerAction === TurnActionEnum.MISS
    ) {
      this.showPlayerAction = true;
      setTimeout(() => {
        this.showPlayerAction = false;
      }, 1000);
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

  triggerVictory(result: FightResultModel) {
    animateElement('.player-image', 'pulse');
    animateElement('.enemy-image', 'hinge', () => {
      this.victory = true;
      this.store.dispatch(new EndFight());
      setTimeout(() => {
        animateElement('.finish-quest-screen', 'jackInTheBox');
        setTimeout(() => {
          this.afterVictory(result);
        }, 1500);
      });
    });
    this.cdr.detectChanges();
  }

  triggerDefeat(result: FightResultModel) {
    animateElement('.enemy-image', 'pulse');
    animateElement('.player-image', 'hinge', () => {
      this.defeat = true;
      this.store.dispatch(new EndFight());
      setTimeout(() => {
        animateElement('.defeat-title', 'jackInTheBox');
        setTimeout(() => {
          this.afterDefeat(result);
        }, 1500);
      });
    });
    this.cdr.detectChanges();
  }

  openConsumableModal() {
    const config: ModalOptions = {
      initialState: {
        accept: (itemId: number) => {
          if (itemId !== null) {
            this.doAction(TurnActionEnum.USE_ITEM, itemId);
          }
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConsumableModalComponent, config);
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

  getEnergyBarHeight() {
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

  getTimerBarHeight() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 30;
      case 'md':
        return 20;
      case 'xs':
      case 'sm':
      default:
        return 15;
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
    this.cdr.detectChanges();
    setTimeout(() => {
      this.playerAnimation = '';
    }, duration * 1000);
  }

  // duration in seconds
  private handleEnemyAnimation(animation: string, duration: number) {
    this.enemyAnimation = `${animation} ${duration}s`;
    this.cdr.detectChanges();
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
          this.onSurrender();
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }
}
