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
  FightResultModel,
  FightTurnModel,
  TurnActionEnum,
} from '../../models/fight.model';
import { TemplatePage } from '../template-page.component';
import { FightLogsModalComponent } from './components/fight-logs-modal/fight-logs-modal.component';
import {
  BaseFighterModel,
  BaseFightModel,
  FightTypes,
} from './models/base-fight.model';
import { FightAnimationsService } from './services/fight-animations.service';

@Component({
  selector: 'app-base-fight',
  templateUrl: './base-fight.component.html',
  styleUrls: ['./base-fight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BaseFightComponent
  extends TemplatePage
  implements OnInit, OnDestroy {
  // Constants
  public prefix = ViewportService.getPreffixImg();
  public fightTypes = FightTypes;
  public buffType = BuffType;
  public turnActions = TurnActionEnum;

  // Variable
  public player = signal<BaseFighterModel>(null);
  public enemy = signal<BaseFighterModel>(null);
  public victory = false;
  public defeat = false;
  private lastClickTime: number = 0;
  private destroy$ = new Subject<void>();
  private fightTurns: FightTurnModel[] = [];
  public bonusActionsRemaining = 0;
  public bonusActionsTotal = 0;
  public isAnimating = signal<boolean>(false);

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
  @Output() onBonusAction = new EventEmitter<number>();

  public fightId = signal<string>(null);
  constructor(
    private store: Store,
    private viewportService: ViewportService,
    private modalService: BsModalService,
    private cdr: ChangeDetectorRef,
    private fightAnimationsService: FightAnimationsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.setupFightListener();
    this.setupFightResultListeners();
  }

  openBonusActionModal() {
    const config: ModalOptions = {
      initialState: {
        title: 'Quick Action',
        description: 'Select a quick action to use without consuming your turn:',
        isBonusAction: true,
        accept: (itemId: number) => {
          if (itemId !== null) {
            this.useBonusAction(itemId);
          }
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(
      ConsumableModalComponent,
      config
    );
  }

  // Método para usar una acción adicional
  useBonusAction(consumableId: number) {
    // Limpiar animaciones antes de aplicar nuevas
    this.fightAnimationsService.clearAllAnimations();
    this.onBonusAction.emit(consumableId);
  }

  private setupFightListener() {
    this.fight$
      .pipe(takeUntil(this.destroy$))
      .subscribe((fight: BaseFightModel) => {
        if (fight) {
          const { player, enemy, load, turns, fightId } = fight;
          this.fightId.set(fightId);
          this.player.set(player);
          this.enemy.set(enemy);
          this.fightTurns = turns;
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

  async onActionSubmited(fight: BaseFightModel) {
    // Guardamos el estado actual antes de actualizarlo
    const previousPlayerState = { ...this.player() };
    const previousEnemyState = { ...this.enemy() };
    
    const { player, enemy } = fight;

    // Si es una actualización de buff solamente, actualizamos inmediatamente
    if (fight.buffUpdateOnly) {
      this.player.set(player);
      this.enemy.set(enemy);
    } else {
      // Para acciones normales, esperamos a que terminen las animaciones
      try {
        this.isAnimating.set(true);
        // Primero ejecutamos las animaciones manteniendo los estados anteriores
        await this.fightAnimationsService.controlTurnActions(fight, previousPlayerState, previousEnemyState);
        
        // Una vez terminadas las animaciones, actualizamos los estados
        this.player.set(player);
        this.enemy.set(enemy);
        this.isAnimating.set(false);

        // Verificamos si algún luchador ha sido derrotado
        const ripPlayer = player.currentStats.health < 1;
        const ripEnemy = enemy.currentStats.health < 1;

        if (ripPlayer || ripEnemy) {
          setTimeout(() => {
            ripPlayer
              ? this.triggerDefeat(fight.result)
              : this.triggerVictory(fight.result);
          }, 1000);
        }
      } catch (error) {
        console.error('Error during fight animation:', error);
        // En caso de error, actualizamos los estados de todas formas
        this.player.set(player);
        this.enemy.set(enemy);
        this.isAnimating.set(false);
      }
    }
  }

  triggerVictory(result: FightResultModel) {
    animateElement('.player-status-container', 'pulse');
    animateElement('.enemy-status-container', 'hinge', {
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
    animateElement('.enemy-status-container', 'pulse');
    animateElement('.player-status-container', 'hinge', {
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
    const modalRef = this.modalService.show(
      ConsumableModalComponent,
      config
    );
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

  showCombatLog() {
    const config: ModalOptions = {
      initialState: {
        fightTurns: this.fightTurns,
        player: this.player().name,
        enemy: this.enemy().name,
      },
    };
    const modalRef = this.modalService.show(FightLogsModalComponent, config);
  }

  showDamageNumber(target: 'player' | 'enemy', amount: number, isCritical: boolean = false) {
    const targetElement = document.querySelector(`.${target}-image`);
    if (!targetElement) return;

    const damageElement = document.createElement('div');
    damageElement.className = `damage-number ${isCritical ? 'critical' : ''}`;
    damageElement.textContent = `-${amount}`;

    // Position the damage number near the target
    const rect = targetElement.getBoundingClientRect();
    damageElement.style.left = `${rect.left + rect.width / 2}px`;
    damageElement.style.top = `${rect.top + rect.height / 3}px`;

    document.body.appendChild(damageElement);

    // Remove the element after animation completes
    setTimeout(() => {
      document.body.removeChild(damageElement);
    }, 1500);
  }

  showHealingNumber(target: 'player' | 'enemy', amount: number) {
    const targetElement = document.querySelector(`.${target}-image`);
    if (!targetElement) return;

    const healingElement = document.createElement('div');
    healingElement.className = 'damage-number healing';
    healingElement.textContent = `+${amount}`;

    // Position the healing number near the target
    const rect = targetElement.getBoundingClientRect();
    healingElement.style.left = `${rect.left + rect.width / 2}px`;
    healingElement.style.top = `${rect.top + rect.height / 3}px`;

    document.body.appendChild(healingElement);

    // Remove the element after animation completes
    setTimeout(() => {
      document.body.removeChild(healingElement);
    }, 1500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
