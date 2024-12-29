import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { TurnActionEnum } from 'src/modules/core/models/fight.model';
import { ViewportService } from 'src/services/viewport.service';
import { BaseFighterModel, BaseFightModel } from '../models/base-fight.model';
import { FightNotificationService } from './fight-notifications.service';

@Injectable({
  providedIn: 'root',
})
export class FightAnimationsService {
  private renderer: Renderer2;

  constructor(
    private rendererFactory: RendererFactory2,
    private fightNotificationsService: FightNotificationService,
    private viewportService: ViewportService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public controlTurnActions(fight: BaseFightModel) {
    const { player, enemy } = fight;

    this.processTurnAction(
      player,
      '.player-image',
      '.enemy-container',
      '.player-container',
      this.viewportService.screenWidth == 'xs' ? 'up' : 'right'
    );
    this.processTurnAction(
      enemy,
      '.enemy-image',
      '.player-container',
      '.enemy-container',
      this.viewportService.screenWidth == 'xs' ? 'down' : 'left'
    );
  }

  private processTurnAction(
    fighter: BaseFighterModel,
    imageSelector: string,
    enemyNotificationContainer: string,
    playerNotificationContainer: string,
    direction: 'right' | 'left' | 'up' | 'down'
  ) {
    const action = fighter.lastTurn.action;
    const damage = fighter.lastTurn.damage;

    switch (action) {
      case TurnActionEnum.ATTACK:
        this.handleFighterAnimation(imageSelector, `attack-${direction}`, 1);
        if (damage > 0) {
          this.fightNotificationsService.showNotification(
            enemyNotificationContainer,
            FightNotificationService.getDamageHtml(damage)
          );
        }
        break;

      case TurnActionEnum.CRIT:
        this.handleFighterAnimation(
          imageSelector,
          `crit-attack-${direction}`,
          1
        );
        if (damage > 0) {
          this.fightNotificationsService.showNotification(
            enemyNotificationContainer,
            FightNotificationService.getCritDamageHtml(damage)
          );
        }
        break;

      case TurnActionEnum.DEFEND:
        this.handleFighterAnimation(imageSelector, `defend-${direction}`, 1);
        break;

      case TurnActionEnum.CHARGE:
        this.handleFighterAnimation(imageSelector, 'charge', 1);
        break;

      case TurnActionEnum.BLOCKED:
        this.handleFighterAnimation(imageSelector, 'blocked', 1);
        this.fightNotificationsService.showNotification(
          playerNotificationContainer,
          FightNotificationService.getBlockHTML()
        );
        break;

      case TurnActionEnum.MISS:
        this.handleFighterAnimation(imageSelector, 'missed', 1);
        this.fightNotificationsService.showNotification(
          playerNotificationContainer,
          FightNotificationService.getMissHTML()
        );
        break;

      default:
        break;
    }
  }

  private handleFighterAnimation(
    cssSelector: string,
    animation: string,
    duration: number
  ) {
    const element = document.querySelector(cssSelector);
    if (element) {
      this.renderer.setStyle(
        element,
        'animation',
        `${animation} ${duration}s ease-in-out`
      );
      setTimeout(() => {
        this.renderer.removeStyle(element, 'animation');
      }, duration * 1000);
    }
  }
}
