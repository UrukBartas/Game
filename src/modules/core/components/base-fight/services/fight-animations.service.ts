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
      '.player-status-container',
      '.enemy-status-container',
      '.player-container',
      this.viewportService.screenWidth == 'xs' ? 'up' : 'right'
    );
    this.processTurnAction(
      enemy,
      '.enemy-status-container',
      '.player-status-container',
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
    const damages = fighter.lastTurn.damages;
    const damage = damages && damages.length > 0 ? damages[0].damage : 0;

    // Update background effect for all actions
    this.updateBackgroundEffect(action);

    switch (action) {
      case TurnActionEnum.ATTACK:
        this.handleFighterAnimation(imageSelector, `attack-${direction}`, 1);
        if (damage > 0) {
          const targetSelector = imageSelector === '.player-status-container' ? 'enemy' : 'player';
          this.showDamageNumber(targetSelector, damage, false);

          const targetElementSelector = imageSelector === '.player-status-container' ? '.enemy-status-container' : '.player-status-container';
          animateElement(targetElementSelector, 'damage-flash');
        }
        break;

      case TurnActionEnum.CRIT:
        this.handleFighterAnimation(
          imageSelector,
          `crit-attack-${direction}`,
          1
        );
        if (damage > 0) {
          const targetSelector = imageSelector === '.player-status-container' ? 'enemy' : 'player';
          this.showDamageNumber(targetSelector, damage, true);

          const targetElementSelector = imageSelector === '.player-status-container' ? '.enemy-status-container' : '.player-status-container';
          this.playCriticalHitEffect(targetElementSelector);
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
        const blockTarget = imageSelector === '.player-status-container' ? '.player-status-container' : '.enemy-status-container';
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
      impact.style.left = `${element.getBoundingClientRect().left + element.clientWidth / 2 - 75}px`;
      impact.style.top = `${element.getBoundingClientRect().top + element.clientHeight / 2 - 75}px`;
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
      block.style.left = `${element.getBoundingClientRect().left + element.clientWidth / 2 - 60}px`;
      block.style.top = `${element.getBoundingClientRect().top + element.clientHeight / 2 - 60}px`;
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

      switch (action) {
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
    const playerImage = document.querySelector('.player-status-container');
    const enemyImage = document.querySelector('.enemy-status-container');

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

  private showDamageNumber(target: 'player' | 'enemy', amount: number, isCritical: boolean = false) {
    const targetElement = document.querySelector(`.${target}-image`);
    if (!targetElement) return;

    const damageElement = document.createElement('div');
    damageElement.className = `damage-number ${isCritical ? 'critical' : ''}`;
    damageElement.textContent = `-${amount}`;

    const rect = targetElement.getBoundingClientRect();
    damageElement.style.left = `${rect.left + rect.width / 2}px`;
    damageElement.style.top = `${rect.top + rect.height / 3}px`;

    document.body.appendChild(damageElement);

    setTimeout(() => {
      if (document.body.contains(damageElement)) {
        document.body.removeChild(damageElement);
      }
    }, 1500);
  }
}
