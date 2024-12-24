import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { Rarity } from 'src/modules/core/models/items.model';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { ConsumableModalComponent } from 'src/modules/game/components/consumable-modal/consumable-modal.component';
import {
  animateElement,
  getRarityBasedOnIRI,
  getRarityColor,
} from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { EndFight } from 'src/store/main.store';
import { BuffType } from '../../models/fight-buff.model';
import {
  FighterTurnModel,
  FightModel,
  FightResultModel,
  TurnActionEnum,
} from '../../models/fight.model';
import { PlayerModel } from '../../models/player.model';
import { QuestModel } from '../../models/quest.model';
import { TemplatePage } from '../template-page.component';

@Component({
  selector: 'app-base-fight',
  templateUrl: './base-fight.component.html',
  styleUrls: ['./base-fight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export abstract class BaseFightComponent extends TemplatePage {
  @Input() backgroundImage: string;
  @Input() quest: QuestModel;
  @Input() player: PlayerModel;
  @Input() enemy: PlayerModel;
  @Input() set setFight(fight: FightModel) {
    if (fight) {
      if (this.fight) {
        this.onActionSubmited(fight);
      }
      this.fight = fight;
    }
  }

  @Output() onActionSubmit = new EventEmitter<{
    action: TurnActionEnum;
    consumableId?: number;
  }>();
  @Output() onSurrender = new EventEmitter<void>();
  @Output() onDefeat = new EventEmitter<FightResultModel>();
  @Output() onVictory = new EventEmitter<FightResultModel>();

  public turnActions = TurnActionEnum;
  public victory = false;
  public defeat = false;
  public fight: FightModel;
  public showPlayerAction = false;
  public showEnemyAction = false;
  public showReceivedPlayerDamage = false;
  public showReceivedEnemyDamage = false;
  public playerAnimation;
  public enemyAnimation;
  public buffType = BuffType;
  public isOpponent = false;
  public prefix = environment.permaLinkImgPref;
  public getRarityColor = getRarityColor;
  public getRarityBasedOnIRI = getRarityBasedOnIRI;
  public IRI = 0;
  public IRI_RARITY: Rarity = Rarity.COMMON;
  private lastClickTime: number = 0;

  constructor(
    protected store: Store,
    protected viewportService: ViewportService,
    protected modalService: BsModalService,
    protected cdr: ChangeDetectorRef
  ) {
    super();
  }

  doAction(action: TurnActionEnum, consumableId?: number) {
    const currentTime = Date.now();

    if (currentTime - this.lastClickTime < 1000 || this.fight.result) {
      return;
    }
    this.lastClickTime = currentTime;

    this.onActionSubmit.emit({ action, consumableId });
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
        this.viewportService.screenWidth == 'xs' ? 'attack-up' : 'attack-right',
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
        this.viewportService.screenWidth == 'xs'
          ? 'attack-down'
          : 'attack-left',
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

  getTurn(): {
    playerTurn: FighterTurnModel;
    enemyTurn: FighterTurnModel;
  } {
    const turn = this.fight.turns[this.fight.turns.length - 1];
    return {
      playerTurn: this.isOpponent ? turn.enemyTurn : turn.playerTurn,
      enemyTurn: this.isOpponent ? turn.playerTurn : turn.enemyTurn,
    };
  }

  triggerVictory(result: FightResultModel) {
    animateElement('.player-image', 'pulse');
    animateElement('.enemy-image', 'hinge', {
      callback: () => {
        this.victory = true;
        this.store.dispatch(new EndFight());
        animateElement('.finish-quest-screen', 'jackInTheBox', {
          callback: () => this.onVictory.emit(result),
          callbackTimeout: 1000,
          callbackSafeTimeout: 2000,
        });
      },
      callbackSafeTimeout: 2000,
    });
    this.cdr.detectChanges();
  }

  triggerDefeat(result: FightResultModel) {
    animateElement('.enemy-image', 'pulse');
    animateElement('.player-image', 'hinge', {
      callback: () => {
        this.defeat = true;
        this.store.dispatch(new EndFight());
        animateElement('.defeat-title', 'jackInTheBox', {
          callback: () => this.onDefeat.emit(result),
          callbackTimeout: 1000,
          callbackSafeTimeout: 2000,
        });
      },
      callbackSafeTimeout: 2000,
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
    switch (this.viewportService.screenWidth) {
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
    switch (this.viewportService.screenWidth) {
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
    switch (this.viewportService.screenWidth) {
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
    switch (this.viewportService.screenWidth) {
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
          this.onSurrender.emit();
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }
}
