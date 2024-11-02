import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseFightComponent } from 'src/modules/core/components/base-fight.component';
import {
  FighterTurnModel,
  FightResultModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { Rarity } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import {
  getIRIFromCurrentPlayer,
  getRarityBasedOnIRI,
  getRarityColor,
} from 'src/modules/utils';
import { FightService } from 'src/services/fight.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, StartFight } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';

@Component({
  selector: 'app-quest-fight',
  templateUrl: './quest-fight.component.html',
  styleUrls: ['./quest-fight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuestFightComponent extends BaseFightComponent implements OnInit {
  quest: QuestModel = this.store
    .selectSnapshot(MainState.getState)
    .quests.find((quest) => quest.startedAt !== null);
  fightBackgroundImage = this.getBackground();
  player: PlayerModel = this.store.selectSnapshot(MainState.getState).player;
  public prefix = environment.permaLinkImgPref;
  public IRI = 0;
  public IRI_RARITY: Rarity = Rarity.COMMON;
  public rarityEnum = Rarity;
  public getRarityColor = getRarityColor;
  public getRarityBasedOnIRI = getRarityBasedOnIRI;

  constructor(
    store: Store,
    viewportService: ViewportService,
    modalService: BsModalService,
    private fightService: FightService,
    cdr: ChangeDetectorRef
  ) {
    super(store, viewportService, modalService, cdr);
  }

  ngOnInit() {
    this.fightService
      .get('/')
      .pipe(take(1))
      .subscribe({
        next: (fight) => {
          this.fight = fight;
          this.store.dispatch(new StartFight(fight));
        },
        error: () => {
          this.questStatusChange.emit({ status: QuestStatusEnum.PICKING });
        },
      });
    this.IRI = getIRIFromCurrentPlayer(this.player);
    this.IRI_RARITY = getRarityBasedOnIRI(this.IRI);
  }

  submitAction(action: TurnActionEnum, consumableId?: number): void {
    this.fightService
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
    this.questStatusChange.emit({
      status: QuestStatusEnum.RESULT,
      data: result,
    });
  }

  afterDefeat(result: FightResultModel): void {
    this.questStatusChange.emit({
      status: QuestStatusEnum.RESULT,
      data: result,
    });
  }

  onSurrender(): void {
    this.fightService
      .surrender()
      .pipe(take(1))
      .subscribe((quest) => this.triggerDefeat({ newQuest: quest }));
  }

  getBackground(): string {
    return this.quest.data.backgroundImage;
  }
}
