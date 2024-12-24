import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseFightComponent } from 'src/modules/core/components/base-fight/base-fight.component';
import {
  FighterTurnModel,
  FightResultModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { Rarity } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import {
  getIRIFromCurrentPlayer,
  getRarityBasedOnIRI,
  getRarityColor,
} from 'src/modules/utils';
import { PvPFightService } from 'src/services/pvp-fight.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-pvp-autofight',
  templateUrl: './pvp-autofight.component.html',
  styleUrl: './pvp-autofight.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AutoPvpFightComponent
{
  /* fightBackgroundImage = this.getBackground();
  player: PlayerModel = this.store.selectSnapshot(MainState.getState).player;
  public prefix = environment.permaLinkImgPref;
  public IRI = 0;
  public IRI_RARITY: Rarity = Rarity.COMMON;
  public rarityEnum = Rarity;
  public getRarityColor = getRarityColor;
  public getRarityBasedOnIRI = getRarityBasedOnIRI;
  public playersData;

  constructor(
    store: Store,
    viewportService: ViewportService,
    modalService: BsModalService,
    private pvpFightService: PvPFightService,
    cdr: ChangeDetectorRef,
    private router: Router
  ) {
    super(store, viewportService, modalService, cdr);
  }

  ngOnInit() {
    this.pvpFightService
      .getAutoFight()
      .pipe(take(1))
      .subscribe({
        next: (fight) => {
          this.fight = fight;
          this.playersData = fight.playersData;
        },
        error: () => {
          this.router.navigateByUrl('/leaderboard');
        },
      });

    this.IRI = getIRIFromCurrentPlayer(this.player);
    this.IRI_RARITY = getRarityBasedOnIRI(this.IRI);
  }

  submitAction(action: TurnActionEnum, consumableId?: number): void {
    this.pvpFightService
      .actions(action, consumableId)
      .pipe(take(1))
      .subscribe((fight) => {
        this.fight = fight;
        this.onActionSubmited(fight);
      });
  }

  getTurn(): {
    playerTurn: FighterTurnModel;
    enemyTurn: FighterTurnModel;
  } {
    const { playerTurn, enemyTurn } =
      this.fight.turns[this.fight.turns.length - 1];

    return { playerTurn, enemyTurn };
  }

  afterVictory(result: FightResultModel): void {
    this.router.navigateByUrl('/arena-result');
  }

  afterDefeat(result: FightResultModel): void {
    this.router.navigateByUrl('/arena-result');
  }

  onSurrender(): void {
    this.pvpFightService
      .surrender()
      .pipe(take(1))
      .subscribe(() => this.triggerDefeat(null));
  }

  getBackground(): string {
    return '/assets/backgrounds/village.webp';
  } */
}
