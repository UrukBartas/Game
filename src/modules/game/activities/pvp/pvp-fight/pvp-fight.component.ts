import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BsModalService } from 'ngx-bootstrap/modal';
import {
  BehaviorSubject,
  interval,
  retry,
  switchMap,
  take,
  takeWhile,
  tap,
} from 'rxjs';
import { BaseFightComponent } from 'src/modules/core/components/base-fight.component';
import {
  FighterTurnModel,
  FightModel,
  FightResultModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { FighterStats } from 'src/modules/core/models/player-stats.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { PvPFightService } from 'src/services/pvp-fight.service';
import { ViewportService } from 'src/services/viewport.service';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-pvp-fight',
  templateUrl: './pvp-fight.component.html',
  styleUrls: ['./pvp-fight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PvPFightComponent
  extends BaseFightComponent
  implements OnInit, OnDestroy
{
  fightBackgroundImage = this.getBackground();
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  player: PlayerModel;
  playerBaseStats: FighterStats;
  playerCurrentStats: FighterStats;
  enemy: PlayerModel;
  enemyBaseStats: FighterStats;
  enemyCurrentStats: FighterStats;
  awaitingOpponent = false;
  awaitingPlayer = false;
  showEnemyStatus = true;
  turnTimer = 0;
  private timerSubject = new BehaviorSubject<void>(null);

  constructor(
    store: Store,
    viewportService: ViewportService,
    modalService: BsModalService,
    private fightService: PvPFightService,
    private websocket: WebSocketService,
    cdr: ChangeDetectorRef
  ) {
    super(store, viewportService, modalService, cdr);
    this.setupFightSockets();
  }

  private setupFightSockets() {
    this.bindSocketEvent('turnResult', this.handleTurnResult);
    this.bindSocketEvent('awaitingPlayer', this.handleAwaitingPlayer);
    this.bindSocketEvent('enemySurrender', this.handleEnemyLose);
    this.bindSocketEvent('playerSurrender', this.handleLoseByTimeout);
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
          const currentPlayer = this.store.selectSnapshot(
            MainState.getState
          ).player;
          const { baseStats, currentStats, playersData } = fight;
          const { player, enemy } = playersData;

          this.fight = fight;
          this.isOpponent = currentPlayer.id === playersData.enemy.id;
          this.player = !this.isOpponent ? player : enemy;
          this.enemy = this.isOpponent ? player : enemy;
          this.playerBaseStats = !this.isOpponent
            ? baseStats.player
            : baseStats.enemy;
          this.enemyBaseStats = this.isOpponent
            ? baseStats.player
            : baseStats.enemy;
          this.playerCurrentStats = !this.isOpponent
            ? currentStats.player
            : currentStats.enemy;
          this.enemyCurrentStats = this.isOpponent
            ? currentStats.player
            : currentStats.enemy;
          this.startTurnTimer();
        },
        error: () => {
          this.router.navigateByUrl('/leaderboard');
        },
      });
  }

  private bindSocketEvent(event: string, handler: Function) {
    this.websocket.socket.on(event, handler.bind(this));
  }

  private unbindSocketEvent(event: string, handler: Function) {
    this.websocket.socket.off(event, handler.bind(this));
  }

  private handleTurnResult(fight: FightModel) {
    const { currentStats } = fight;

    this.fight = fight;
    this.awaitingOpponent = false;
    this.awaitingPlayer = false;
    this.playerCurrentStats = !this.isOpponent
      ? currentStats.player
      : currentStats.enemy;
    this.enemyCurrentStats = this.isOpponent
      ? currentStats.player
      : currentStats.enemy;
    this.onActionSubmited(fight);

    this.showEnemyStatus = false;
    setTimeout(() => {
      this.showEnemyStatus = true;
    }, 1000);

    this.timerSubject.next();
  }

  private handleAwaitingPlayer() {
    this.awaitingPlayer = true;
  }

  private handleLoseByTimeout() {
    this.showEnemyStatus = false;
    this.triggerDefeat(null);
  }

  private handleEnemyLose() {
    this.showEnemyStatus = false;
    this.triggerVictory(null);
  }

  private startTurnTimer() {
    this.timerSubject
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

  getBackground(): string {
    return '/assets/backgrounds/village.webp';
  }

  submitAction(action: TurnActionEnum, consumableId?: number): void {
    this.awaitingOpponent = true;
    this.websocket.socket.emit('submitTurn', { action, consumableId });
  }

  afterVictory(result: FightResultModel): void {
    this.router.navigateByUrl('/arena-result');
  }

  afterDefeat(result: FightResultModel): void {
    this.router.navigateByUrl('/arena-result');
  }

  onSurrender(): void {
    this.websocket.socket.emit('surrender');
    this.showEnemyStatus = false;
    this.triggerDefeat(null);
  }

  ngOnDestroy() {
    this.unbindSocketEvent('turnResult', this.handleTurnResult);
    this.unbindSocketEvent('awaitingPlayer', this.handleAwaitingPlayer);
    this.unbindSocketEvent('enemySurrender', this.handleEnemyLose);
  }
}
