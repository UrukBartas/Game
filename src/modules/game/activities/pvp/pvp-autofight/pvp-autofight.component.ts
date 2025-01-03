import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject, take } from 'rxjs';
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
import { StartFight } from 'src/store/main.store';

@Component({
  selector: 'app-pvp-autofight',
  templateUrl: './pvp-autofight.component.html',
  styleUrl: './pvp-autofight.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AutoPvpFightComponent {
  private pvpFightService = inject(PvPFightService);
  private router = inject(Router);
  private store = inject(Store);
  fightType = FightTypes.AUTOPVP;
  playersData: FightDataModel;

  fight$ = new Subject<BaseFightModel>();
  triggerDefeat$ = new Subject<void>();

  ngOnInit() {
    this.pvpFightService
      .getAutoFight()
      .pipe(take(1))
      .subscribe({
        next: (fight) => {
          this.playersData = fight.playersData;
          this.fight$.next(this.adaptFight(fight, true));
          this.store.dispatch(new StartFight(this.fightType));
        },
        error: () => {
          this.router.navigateByUrl('/leaderboard');
        },
      });
  }

  onActionSubmitted(event): void {
    const { action, consumableId } = event;
    this.pvpFightService
      .actions(action, consumableId)
      .pipe(take(1))
      .subscribe((fight) => {
        this.fight$.next(this.adaptFight(fight, false));
      });
  }

  private adaptFight(fight: FightModel, load: boolean): BaseFightModel {
    const lastTurn = fight.turns[fight.turns?.length - 1];
    const { player, enemy } = this.playersData;

    return {
      load,
      player: {
        name: player.name,
        image: player.image,
        level: player.level,
        title: player.title,
        iri: getIRIFromCurrentPlayer(player),
        baseStats: fight.baseStats.player,
        currentStats: fight.currentStats.player,
        lastTurn: lastTurn?.playerTurn,
      },
      enemy: {
        name: enemy.name,
        image: enemy.image,
        level: enemy.level,
        title: enemy.title,
        iri: getIRIFromCurrentPlayer(enemy),
        baseStats: fight.baseStats.enemy,
        currentStats: fight.currentStats.enemy,
        lastTurn: lastTurn?.enemyTurn,
      },
      turns: fight.turns,
      result: fight.result,
    };
  }

  onVictory(result: FightResultModel): void {
    this.router.navigateByUrl('/arena-result');
  }

  onDefeat(result: FightResultModel): void {
    this.router.navigateByUrl('/arena-result');
  }

  onSurrender(): void {
    this.pvpFightService
      .surrender()
      .pipe(take(1))
      .subscribe(() => this.triggerDefeat$.next(null));
  }

  getBackground(): string {
    return '/assets/backgrounds/village.webp';
  }
}
