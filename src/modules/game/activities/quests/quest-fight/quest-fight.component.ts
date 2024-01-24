import { Component, EventEmitter, Output, inject } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { Store } from '@ngxs/store';
import { MainState, StartFight } from 'src/store/main.store';
import { ViewportService } from 'src/services/viewport.service';
import { FightService } from 'src/services/fight.service';
import {
  FightModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { take } from 'rxjs';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { PlayerStatsModel } from 'src/modules/core/models/player-stats.model';

@Component({
  selector: 'app-quest-fight',
  templateUrl: './quest-fight.component.html',
  styleUrl: './quest-fight.component.scss',
})
export class QuestFightComponent extends TemplatePage {
  private store = inject(Store);
  private viewportService = inject(ViewportService);
  fightService = inject(FightService);
  turnActions = TurnActionEnum;
  @Output() questStatusChange = new EventEmitter<QuestStatusEnum>();
  player: PlayerModel = this.store.selectSnapshot(MainState.getState).player;
  quest: QuestModel = this.store
    .selectSnapshot(MainState.getState)
    .quests.find((quest) => quest.startedAt !== null);
  fight: FightModel;
  enemy: PlayerStatsModel;

  constructor() {
    super();

    this.fightService
      .get('/')
      .pipe(take(1))
      .subscribe((fight) => {
        this.fight = fight;
        this.enemy = this.fight.enemyStats;
        this.store.dispatch(new StartFight(fight));
      });
  }

  doAction(action: TurnActionEnum) {
    this.fightService
      .actions(action)
      .pipe(take(1))
      .subscribe((fight) => {
        const lastTurn = fight.turns[fight.turns.length - 1];
        if (lastTurn.enemyTurn.action === TurnActionEnum.ATTACK) {
          this.animateElement('.player-image', 'shakeX');
        }
        if (lastTurn.playerTurn.action === TurnActionEnum.ATTACK) {
          this.animateElement('.enemy-image', 'shakeX');
        }
        this.fight = fight;
      });
  }

  animateElement(element, animation, prefix = 'animate__') {
    new Promise((resolve, reject) => {
      const animationName = `${prefix}${animation}`;
      const node = document.querySelector(element);

      node.classList.add(`${prefix}animated`, animationName);

      const handleAnimationEnd = (event) => {
        event.stopPropagation();
        node.classList.remove(`${prefix}animated`, animationName);
        resolve('Animation ended');
      };

      node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
  }

  getHealthBarHeight() {
    switch (this.viewportService.screenSize) {
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

  getHealthEnergyHeight() {
    switch (this.viewportService.screenSize) {
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
    switch (this.viewportService.screenSize) {
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
}
