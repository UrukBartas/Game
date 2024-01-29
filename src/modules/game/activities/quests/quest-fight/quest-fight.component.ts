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
  turnActions = TurnActionEnum;
  player: PlayerModel = this.store.selectSnapshot(MainState.getState).player;
  quest: QuestModel = this.store
    .selectSnapshot(MainState.getState)
    .quests.find((quest) => quest.startedAt !== null);
  fight: FightModel;
  enemy: PlayerStatsModel;
  victory = false;
  defeat = false;

  @Output() questStatusChange = new EventEmitter<QuestStatusEnum>();

  constructor(
    private store: Store,
    private viewportService: ViewportService,
    private fightService: FightService
  ) {
    super();

    this.fightService
      .get('/')
      .pipe(take(1))
      .subscribe({
        next: (fight) => {
          this.fight = fight;
          this.enemy = this.fight.enemyStats;
          this.store.dispatch(new StartFight(fight));
        },
        error: () => {
          this.questStatusChange.emit(QuestStatusEnum.PICKING);
        },
      });
  }

  doAction(action: TurnActionEnum) {
    this.fightService
      .actions(action)
      .pipe(take(1))
      .subscribe((fight) => {
        const lastTurn = fight.turns[fight.turns.length - 1];

        // player animations
        if (fight.playerStats.health === 0) {
          this.animateElement('.player-image', 'hinge', () => {
            this.defeat = true;
          });
        } else if (fight.enemyStats.health === 0) {
          this.animateElement('.player-image', 'pulse', () => {
            this.victory = true;
          });
        } else if (lastTurn.enemyTurn.action === TurnActionEnum.ATTACK) {
          this.animateElement('.player-image', 'shakeX');
        }

        // enemy animations
        if (fight.enemyStats.health === 0) {
          this.animateElement('.enemy-image', 'hinge');
        } else if (fight.playerStats.health === 0) {
          this.animateElement('.enemy-image', 'pulse');
        } else if (lastTurn.playerTurn.action === TurnActionEnum.ATTACK) {
          this.animateElement('.enemy-image', 'shakeX');
        }

        this.fight = fight;
      });
  }

  animateElement(element, animation, callback?) {
    new Promise((resolve, reject) => {
      const animationName = `animate__${animation}`;
      const node = document.querySelector(element);

      node.classList.add(`animate__animated`, animationName);

      const handleAnimationEnd = (event) => {
        event.stopPropagation();
        node.classList.remove(`animate__animated`, animationName);
        resolve(callback?.());
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
