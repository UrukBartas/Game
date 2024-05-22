import { Location } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService } from 'ngx-bootstrap/modal';
import { retry, take } from 'rxjs';
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
  private location = inject(Location);
  player: PlayerModel;
  playerBaseStats: FighterStats;
  playerCurrentStats: FighterStats;
  enemy: PlayerModel;
  enemyBaseStats: FighterStats;
  enemyCurrentStats: FighterStats;
  awaitingOpponent = false;
  awaitingPlayer = false;
  showEnemyStatus = true;

  constructor(
    store: Store,
    viewportService: ViewportService,
    modalService: BsModalService,
    private fightService: PvPFightService,
    private websocket: WebSocketService
  ) {
    super(store, viewportService, modalService);
    this.setupFightSockets();
  }

  private setupFightSockets() {
    this.bindSocketEvent('turnResult', this.handleTurnResult);
    this.bindSocketEvent('awaitingPlayer', this.handleAwaitingPlayer);
    this.bindSocketEvent('awaitingOpponent', this.handleAwaitingOpponent);
    this.bindSocketEvent('enemySurrender', this.handleEnemySurrender);
  }

  ngOnInit() {
    this.fightService
      .get('/')
      .pipe(take(1), retry(2))
      .subscribe({
        next: (fight: FightModel) => {
          if (!fight) {
            this.location.back();
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
        },
        error: () => {
          this.location.back();
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
  }

  private handleAwaitingPlayer() {
    this.awaitingPlayer = true;
  }

  private handleAwaitingOpponent() {
    this.awaitingOpponent = true;
  }

  private handleEnemySurrender() {
    this.triggerVictory(null);
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
    return '/assets/backgrounds/arena.png';
  }

  submitAction(action: TurnActionEnum, consumableId?: number): void {
    this.websocket.socket.emit('submitTurn', { action, consumableId });
  }

  afterVictory(result: FightResultModel): void {
    this.location.back();
  }

  afterDefeat(result: FightResultModel): void {
    this.location.back();
  }

  onSurrender(): void {
    this.websocket.socket.emit('surrender');
    this.triggerDefeat(null);
  }

  ngOnDestroy() {
    this.unbindSocketEvent('turnResult', this.handleTurnResult);
    this.unbindSocketEvent('awaitingPlayer', this.handleAwaitingPlayer);
    this.unbindSocketEvent('awaitingOpponent', this.handleAwaitingOpponent);
    this.unbindSocketEvent('enemySurrender', this.handleEnemySurrender);
  }
}
