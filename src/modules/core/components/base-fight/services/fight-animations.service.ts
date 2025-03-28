import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { TurnActionEnum } from 'src/modules/core/models/fight.model';
import { animateElement } from 'src/modules/utils';
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
    // Limpiar todas las animaciones antes de aplicar nuevas
    this.clearAllAnimations();

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

    // Update background effect for all actions
    this.updateBackgroundEffect(action);

    switch (action) {
      case TurnActionEnum.ATTACK:
        this.handleFighterAnimation(imageSelector, `attack-${direction}`, 1);
        if (damage > 0) {
          this.fightNotificationsService.showNotification(
            enemyNotificationContainer,
            FightNotificationService.getDamageHtml(damage)
          );
          // Add damage flash effect to the target
          const targetSelector = imageSelector === '.player-image' ? '.enemy-image' : '.player-image';
          animateElement(targetSelector, 'damage-flash');
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
          // Add critical hit effect to the target
          const targetSelector = imageSelector === '.player-image' ? '.enemy-image' : '.player-image';
          this.playCriticalHitEffect(targetSelector);
        }
        break;

      case TurnActionEnum.DEFEND:
        this.handleFighterAnimation(imageSelector, `defend-${direction}`, 1);
        // Add defending class for glow effect
        const element = document.querySelector(imageSelector);
        if (element) {
          element.classList.add('defending');
          setTimeout(() => {
            element.classList.remove('defending');
          }, 1000);
        }
        break;

      case TurnActionEnum.CHARGE:
        this.handleFighterAnimation(imageSelector, 'charge', 1);
        // Add charging class for glow effect
        const chargeElement = document.querySelector(imageSelector);
        if (chargeElement) {
          chargeElement.classList.add('charging');
          setTimeout(() => {
            chargeElement.classList.remove('charging');
          }, 1000);
        }
        break;

      case TurnActionEnum.BLOCKED:
        this.handleFighterAnimation(imageSelector, 'blocked', 1);
        this.fightNotificationsService.showNotification(
          playerNotificationContainer,
          FightNotificationService.getBlockHTML()
        );
        // Add block effect
        const blockTarget = imageSelector === '.player-image' ? '.player-image' : '.enemy-image';
        this.playBlockEffect(blockTarget);
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

  private playCriticalHitEffect(targetElement: string) {
    const element = document.querySelector(targetElement);
    if (element) {
      element.classList.add('critical-hit');
      document.body.classList.add('screen-shake');

      const impact = document.createElement('div');
      impact.className = 'impact-effect slash';
      impact.style.left = `${element.getBoundingClientRect().left + element.clientWidth/2 - 75}px`;
      impact.style.top = `${element.getBoundingClientRect().top + element.clientHeight/2 - 75}px`;
      document.body.appendChild(impact);

      animateElement('.impact-effect.slash', 'fadeIn', {
        callback: () => {
          setTimeout(() => {
            animateElement('.impact-effect.slash', 'fadeOut', {
              callback: () => {
                impact.remove();
                element.classList.remove('critical-hit');
                document.body.classList.remove('screen-shake');
              }
            });
          }, 300);
        }
      });
    }
  }

  private playBlockEffect(targetElement: string) {
    const element = document.querySelector(targetElement);
    if (element) {
      element.classList.add('defending');

      const block = document.createElement('div');
      block.className = 'impact-effect block';
      block.style.left = `${element.getBoundingClientRect().left + element.clientWidth/2 - 60}px`;
      block.style.top = `${element.getBoundingClientRect().top + element.clientHeight/2 - 60}px`;
      document.body.appendChild(block);

      animateElement('.impact-effect.block', 'bounceIn', {
        callback: () => {
          setTimeout(() => {
            animateElement('.impact-effect.block', 'fadeOut', {
              callback: () => {
                block.remove();
                element.classList.remove('defending');
              }
            });
          }, 500);
        }
      });
    }
  }

  private updateBackgroundEffect(action: TurnActionEnum) {
    const bg = document.querySelector('.background-image');
    if (bg) {
      bg.classList.remove('attack-phase', 'defend-phase', 'charge-phase');

      switch(action) {
        case TurnActionEnum.ATTACK:
          bg.classList.add('attack-phase');
          break;
        case TurnActionEnum.DEFEND:
          bg.classList.add('defend-phase');
          break;
        case TurnActionEnum.CHARGE:
          bg.classList.add('charge-phase');
          break;
      }

      setTimeout(() => {
        bg.classList.remove('attack-phase', 'defend-phase', 'charge-phase');
      }, 1500);
    }
  }

  // Añadir un método para limpiar todas las animaciones
  public clearAllAnimations() {
    const playerImage = document.querySelector('.player-image');
    const enemyImage = document.querySelector('.enemy-image');

    if (playerImage) {
      playerImage.classList.remove(
        'attacking', 'defending', 'charging', 'charged',
        'attack-right', 'attack-left', 'attack-up', 'attack-down',
        'crit-attack-right', 'crit-attack-left', 'crit-attack-up', 'crit-attack-down',
        'defend-right', 'defend-left', 'blocked', 'missed'
      );
    }

    if (enemyImage) {
      enemyImage.classList.remove(
        'attacking', 'defending', 'charging', 'charged',
        'attack-right', 'attack-left', 'attack-up', 'attack-down',
        'crit-attack-right', 'crit-attack-left', 'crit-attack-up', 'crit-attack-down',
        'defend-right', 'defend-left', 'blocked', 'missed'
      );
    }
  }
}
