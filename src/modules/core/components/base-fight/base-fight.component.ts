import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
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
import { FightResultModel, TurnActionEnum } from '../../models/fight.model';
import { TemplatePage } from '../template-page.component';
import {
  BaseFighterModel,
  BaseFightModel,
  FightTypes,
} from './models/base-fight.model';

@Component({
  selector: 'app-base-fight',
  templateUrl: './base-fight.component.html',
  styleUrls: ['./base-fight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BaseFightComponent
  extends TemplatePage
  implements OnInit, OnDestroy
{
  // Constants
  public prefix = environment.permaLinkImgPref;
  public fightTypes = FightTypes;
  public buffType = BuffType;
  public turnActions = TurnActionEnum;

  // Variable
  public player = signal<BaseFighterModel>(null);
  public enemy = signal<BaseFighterModel>(null);
  public victory = false;
  public defeat = false;
  public showPlayerAction = false;
  public showEnemyAction = false;
  public showReceivedPlayerDamage = false;
  public showReceivedEnemyDamage = false;
  public playerAnimation: string;
  public enemyAnimation: string;
  private lastClickTime: number = 0;
  private destroy$ = new Subject<void>();

  @Input() fightType: FightTypes;
  @Input() backgroundImage: string;
  @Input() fight$: Observable<BaseFightModel>;
  @Input() triggerVictory$: Observable<any>;
  @Input() triggerDefeat$: Observable<any>;

  @Output() onActionSubmit = new EventEmitter<{
    action: TurnActionEnum;
    consumableId?: number;
  }>();
  @Output() onSurrender = new EventEmitter<void>();
  @Output() onDefeat = new EventEmitter<FightResultModel>();
  @Output() onVictory = new EventEmitter<FightResultModel>();

  constructor(
    protected store: Store,
    protected viewportService: ViewportService,
    protected modalService: BsModalService,
    protected cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.setupFightListener();
    this.setupFightResultListeners();
  }

  private setupFightListener() {
    this.fight$
      .pipe(takeUntil(this.destroy$))
      .subscribe((fight: BaseFightModel) => {
        if (fight) {
          const { player, enemy, load } = fight;

          this.player.set(player);
          this.enemy.set(enemy);
          if (!load) {
            this.onActionSubmited(fight);
          }
        }
      });
  }

  private setupFightResultListeners() {
    this.triggerDefeat$?.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      this.triggerDefeat(result);
    });
    this.triggerVictory$?.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      this.triggerVictory(result);
    });
  }

  doAction(action: TurnActionEnum, consumableId?: number) {
    const currentTime = Date.now();

    if (
      currentTime - this.lastClickTime < 1000 ||
      this.defeat ||
      this.victory
    ) {
      return;
    }
    this.lastClickTime = currentTime;

    this.onActionSubmit.emit({ action, consumableId });
  }

  onActionSubmited(fight: BaseFightModel) {
    const { player, enemy } = fight;

    this.controlTurnActions(fight);

    const ripPlayer = player.currentStats.health < 1;
    const ripEnemy = enemy.currentStats.health < 1;

    if (ripPlayer || ripEnemy) {
      ripPlayer
        ? this.triggerDefeat(fight.result)
        : this.triggerVictory(fight.result);
    }
  }

  private controlTurnActions(fight: BaseFightModel) {
    const { player, enemy } = fight;
    const lastPlayerAction = player.lastTurn.action;
    const lastEnemyAction = enemy.lastTurn.action;

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
      if (enemy.lastTurn.damage > 0) {
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
    animateElement('.enemy-image', 'hinge', {
      callback: () => {
        this.victory = true;
        this.store.dispatch(new EndFight(this.fightType));
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
        this.store.dispatch(new EndFight(this.fightType));
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

  getIRIRarityColor(iri: number) {
    return getRarityColor(getRarityBasedOnIRI(iri));
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

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
