import {
  Component,
  DestroyRef,
  inject,
  NgZone,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  BehaviorSubject,
  interval,
  retry,
  Subject,
  switchMap,
  take,
  takeWhile,
  tap,
} from 'rxjs';
import { BaseFightComponent } from 'src/modules/core/components/base-fight/base-fight.component';
import {
  BaseFightModel,
  FightTypes,
} from 'src/modules/core/components/base-fight/models/base-fight.model';
import {
  FightDataModel,
  FightModel,
  FightResultModel,
} from 'src/modules/core/models/fight.model';
import { getIRIFromCurrentPlayer } from 'src/modules/utils';
import { PvPFightService } from 'src/services/pvp-fight.service';
import { ViewportService } from 'src/services/viewport.service';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState, StartFight } from 'src/store/main.store';

@Component({
  selector: 'app-pvp-fight',
  templateUrl: './pvp-fight.component.html',
  styleUrls: ['./pvp-fight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PvPFightComponent {
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private viewportService = inject(ViewportService);

  fightType = FightTypes.PVP;
  playersData: FightDataModel;
  awaitingOpponent = false;
  awaitingPlayer = false;
  showEnemyStatus = true;
  turnTimer = 0;

  fight$ = new Subject<BaseFightModel>();
  triggerDefeat$ = new Subject<void>();
  triggerVictory$ = new Subject<void>();
  timerSubject$ = new BehaviorSubject<void>(null);

  // Necesario para no duplicar eventos sockets
  private boundHandleTurnResult = this.handleTurnResult.bind(this);
  private boundHandleAwaitingPlayer = this.handleAwaitingPlayer.bind(this);
  private boundHandleEnemyLose = this.handleEnemyLose.bind(this);
  private boundHandleLoseByTimeout = this.handleLoseByTimeout.bind(this);

  @ViewChild('baseFight') baseFightComponent: BaseFightComponent;

  fightId: string; // ID único para este combate

  constructor(
    private store: Store,
    private fightService: PvPFightService,
    private websocket: WebSocketService
  ) {
    this.setupFightSockets();

    // Generar un ID único para este combate
    this.fightId = `pvp_${Date.now()}`;
  }

  private setupFightSockets() {
    this.websocket.socket.on('turnResult', this.boundHandleTurnResult);
    this.websocket.socket.on('awaitingPlayer', this.boundHandleAwaitingPlayer);
    this.websocket.socket.on('enemySurrender', this.boundHandleEnemyLose);
    this.websocket.socket.on('playerSurrender', this.boundHandleLoseByTimeout);
  }

  ngOnInit() {
    this.fightService
      .get('/')
      .pipe(take(1), retry(2))
      .subscribe({
        next: (fight: FightModel) => {
          if (!fight) {
            this.router.navigateByUrl('/leaderboard');
            return;
          }
          this.playersData = fight.playersData;
          this.fight$.next(this.adaptFight(fight, true));
          this.store.dispatch(new StartFight(this.fightType));
          this.startTurnTimer();
          this.loadBonusActionsRemaining();
        },
        error: () => {
          this.router.navigateByUrl('/leaderboard');
        },
      });
  }

  private handleTurnResult(fight: FightModel) {
    this.awaitingOpponent = false;
    this.awaitingPlayer = false;

    this.fight$.next(this.adaptFight(fight, false));

    this.showEnemyStatus = false;
    setTimeout(() => {
      this.showEnemyStatus = true;
    }, 1000);

    this.timerSubject$.next();
  }

  onActionSubmitted(event): void {
    const { action, consumableId } = event;
    this.awaitingOpponent = true;
    this.websocket.socket.emit('submitTurn', { action, consumableId });
  }

  private adaptFight(fight: FightModel, load: boolean): BaseFightModel {
    const currentPlayer = this.store.selectSnapshot(MainState.getState).player;
    const { baseStats, currentStats, playersData } = fight;
    const isOpponent = currentPlayer.id === playersData.enemy.id;
    const lastTurn = fight.turns[fight.turns?.length - 1];
    const { player, enemy } = this.playersData;

    const realPlayer = !isOpponent ? player : enemy;
    const realEnemy = isOpponent ? player : enemy;

    const adaptedFight = {
      load,
      player: {
        name: realPlayer.name,
        image: realPlayer.image,
        level: realPlayer.level,
        title: realPlayer.title,
        iri: getIRIFromCurrentPlayer(realPlayer),
        baseStats: !isOpponent ? baseStats.player : baseStats.enemy,
        currentStats: !isOpponent ? currentStats.player : currentStats.enemy,
        lastTurn: !isOpponent ? lastTurn?.playerTurn : lastTurn?.enemyTurn,
      },
      enemy: {
        name: realEnemy.name,
        image: realEnemy.image,
        level: realEnemy.level,
        title: realEnemy.title,
        iri: getIRIFromCurrentPlayer(realEnemy),
        baseStats: isOpponent ? baseStats.player : baseStats.enemy,
        currentStats: isOpponent ? currentStats.player : currentStats.enemy,
        lastTurn: isOpponent ? lastTurn?.playerTurn : lastTurn?.enemyTurn,
      },
      turns: fight.turns,
      result: fight.result,
      fightId: fight.fightId,
    };

    return adaptedFight;
  }

  private handleAwaitingPlayer() {
    this.awaitingPlayer = true;
  }

  private handleLoseByTimeout() {
    this.showEnemyStatus = false;
    this.triggerDefeat$.next(null);
  }

  private handleEnemyLose() {
    this.showEnemyStatus = false;
    this.triggerVictory$.next(null);
  }

  private startTurnTimer() {
    this.timerSubject$
      .pipe(
        switchMap(() => {
          this.turnTimer = 60;
          return interval(1000).pipe(
            takeWhile(() => this.turnTimer > 0),
            tap(() => this.ngZone.run(() => this.turnTimer--))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  getBackground(): string {
    return '/assets/backgrounds/village.webp';
  }

  onVictory(result: FightResultModel): void {
    this.router.navigateByUrl('/arena-result');
  }

  onDefeat(result: FightResultModel): void {
    this.router.navigateByUrl('/arena-result');
  }

  onSurrender(): void {
    this.websocket.socket.emit('surrender');
    this.showEnemyStatus = false;
    this.triggerDefeat$.next(null);
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

  ngOnDestroy() {
    this.websocket.socket.off('turnResult', this.boundHandleTurnResult);
    this.websocket.socket.off('awaitingPlayer', this.boundHandleAwaitingPlayer);
    this.websocket.socket.off('enemySurrender', this.boundHandleEnemyLose);
    this.websocket.socket.off('playerSurrender', this.boundHandleLoseByTimeout);
  }

  // Cargar acciones adicionales disponibles
  loadBonusActionsRemaining() {
    this.fightService.getBonusActionsRemaining().subscribe(data => {
      this.updateBonusActions(data);
    });
  }

  // Actualizar el componente base con los datos de acciones adicionales
  updateBonusActions(data: { used: number, remaining: number, total: number }) {
    if (this.baseFightComponent) {
      this.baseFightComponent.bonusActionsRemaining = data.remaining;
      this.baseFightComponent.bonusActionsTotal = data.total;
    }
  }

  // Método para usar una acción adicional
  onBonusAction(consumableId: number): void {
    this.fightService.usePotion(consumableId).subscribe(fight => {
      // Emitir el resultado al websocket para sincronizar con el oponente
      this.websocket.socket.emit('bonusAction', { consumableId });

      // Marcar esta actualización como una actualización de buff solamente
      const adaptedFight = this.adaptFight(fight, false);
      adaptedFight.buffUpdateOnly = true;

      // Actualizar inmediatamente el estado local
      this.fight$.next(adaptedFight);
      this.loadBonusActionsRemaining();
    });
  }

}
