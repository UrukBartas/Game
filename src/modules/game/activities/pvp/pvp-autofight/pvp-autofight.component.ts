import { Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject, take } from 'rxjs';
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
  fightId: string; // ID único para este combate
  @ViewChild('baseFight') baseFightComponent: BaseFightComponent;

  constructor() {
    this.fightId = `autopvp_${Date.now()}`;
  }

  ngOnInit() {
    this.pvpFightService
      .getAutoFight()
      .pipe(take(1))
      .subscribe({
        next: (fight) => {
          this.playersData = fight.playersData;
          this.fight$.next(this.adaptFight(fight, true));
          this.store.dispatch(new StartFight(this.fightType));
          this.loadBonusActionsRemaining();
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
      fightId: fight.fightId,
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

  // Cargar acciones adicionales disponibles
  loadBonusActionsRemaining() {
    this.pvpFightService.getAutoPvPBonusActionsRemaining().subscribe(data => {
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
    this.pvpFightService.useAutoPvPPotion(consumableId).subscribe(fight => {
      // Marcar esta actualización como una actualización de buff solamente
      const adaptedFight = this.adaptFight(fight, false);
      adaptedFight.buffUpdateOnly = true;

      // Actualizar inmediatamente el estado local
      this.fight$.next(adaptedFight);
      this.loadBonusActionsRemaining();
    });
  }
}
