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
  private readonly TURN_ANIMATION_DURATION = 500; // Duration in ms for each turn animation

  constructor(
    private rendererFactory: RendererFactory2,
    private fightNotificationsService: FightNotificationService,
    private viewportService: ViewportService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public async controlTurnActions(
    fight: BaseFightModel,
    previousPlayerState?: BaseFighterModel,
    previousEnemyState?: BaseFighterModel
  ) {
    // Limpiar todas las animaciones antes de aplicar nuevas
    this.clearAllAnimations();

    const { player, enemy } = previousPlayerState && previousEnemyState ? 
      { player: previousPlayerState, enemy: previousEnemyState } : 
      fight;

    // Si el jugador está muerto, no procesamos ningún turno
    if (player.currentStats.health <= 0) {
      return;
    }

    // Procesar el turno del jugador primero
    await this.processTurnActionWithDelay(
      player,
      '.player-status-container',
      '.enemy-status-container',
      '.player-container',
      this.viewportService.screenWidth == 'xs' ? 'up' : 'right'
    );

    // Si el enemigo está muerto después del turno del jugador, no procesamos su turno
    if (enemy.currentStats.health <= 0) {
      return;
    }

    // Calcular el tiempo de espera basado en la acción
    const waitTime = (() => {
      switch (player.lastTurn.action) {
        case TurnActionEnum.BLOCKED:
        case TurnActionEnum.MISS:
          return this.TURN_ANIMATION_DURATION * 2; // Doble tiempo para bloqueos y misses
        default:
          return this.TURN_ANIMATION_DURATION;
      }
    })();

    // Esperar antes de procesar el turno del enemigo
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Procesar el turno del enemigo después
    await this.processTurnActionWithDelay(
      enemy,
      '.enemy-status-container',
      '.player-status-container',
      '.enemy-container',
      this.viewportService.screenWidth == 'xs' ? 'down' : 'left'
    );
  }

  private async processTurnActionWithDelay(
    fighter: BaseFighterModel,
    imageSelector: string,
    enemyNotificationContainer: string,
    playerNotificationContainer: string,
    direction: 'right' | 'left' | 'up' | 'down'
  ): Promise<void> {
    return new Promise((resolve) => {
      const action = fighter.lastTurn.action;
      const damages = fighter.lastTurn.damages;
      const healings = fighter.lastTurn.healings;
      const damage = damages && damages.length > 0 ? damages[0].damage : 0;

      // Update background effect for all actions
      this.updateBackgroundEffect(action);

      let totalAnimationTime = this.TURN_ANIMATION_DURATION;

      // Determinar si es el turno del jugador o del enemigo
      const isPlayerTurn = imageSelector === '.player-status-container';

      // Primero procesamos la acción principal
      switch (action) {
        case TurnActionEnum.ATTACK:
          this.handleFighterAnimation(imageSelector, `attack-${direction}`, 1);
          if (damage > 0) {
            setTimeout(() => {
              const targetSelector = isPlayerTurn ? 'enemy' : 'player';
              this.showDamageNumber(targetSelector, damage, false);
              const targetElementSelector = isPlayerTurn ? '.enemy-status-container' : '.player-status-container';
              animateElement(targetElementSelector, 'damage-flash');
            }, 500);
          }
          break;

        case TurnActionEnum.CRIT:
          this.handleFighterAnimation(imageSelector, `crit-attack-${direction}`, 1);
          if (damage > 0) {
            setTimeout(() => {
              const targetSelector = isPlayerTurn ? 'enemy' : 'player';
              this.showDamageNumber(targetSelector, damage, true);
              const targetElementSelector = isPlayerTurn ? '.enemy-status-container' : '.player-status-container';
              this.playCriticalHitEffect(targetElementSelector);
            }, 500);
          }
          break;

        case TurnActionEnum.DEFEND:
          this.handleFighterAnimation(imageSelector, `defend-${direction}`, 1);
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
          const chargeElement = document.querySelector(imageSelector);
          if (chargeElement) {
            chargeElement.classList.add('charging');
            setTimeout(() => {
              chargeElement.classList.remove('charging');
            }, 1000);
          }
          break;

        case TurnActionEnum.BLOCKED:
          totalAnimationTime = this.TURN_ANIMATION_DURATION * 2; // Doble tiempo para bloqueos
          // Realizar la animación de ataque primero
          this.handleFighterAnimation(imageSelector, `attack-${direction}`, 1);
          
          // Mostrar el bloqueo en el objetivo
          const targetContainerBlocked = isPlayerTurn ? 
            '.enemy-status-container' : '.player-status-container';
          const targetNotificationBlocked = isPlayerTurn ? 
            enemyNotificationContainer : playerNotificationContainer;

          setTimeout(() => {
            this.handleFighterAnimation(targetContainerBlocked, 'blocked', 1);
            this.fightNotificationsService.showNotification(
              targetNotificationBlocked,
              FightNotificationService.getBlockHTML()
            );
            this.playBlockEffect(targetContainerBlocked);
          }, 500);
          break;

        case TurnActionEnum.MISS:
          totalAnimationTime = this.TURN_ANIMATION_DURATION * 2; // Tiempo extra para misses
          // Realizar la animación de ataque primero
          this.handleFighterAnimation(imageSelector, `attack-${direction}`, 1);
          
          // Mostrar el miss en el objetivo (el que evadió el ataque)
          const targetContainerMiss = isPlayerTurn ? 
            '.enemy-status-container' : '.player-status-container';
          const targetNotificationMiss = isPlayerTurn ? 
            enemyNotificationContainer : playerNotificationContainer;

          setTimeout(() => {
            this.handleFighterAnimation(targetContainerMiss, 'missed', 1);
            this.fightNotificationsService.showNotification(
              targetNotificationMiss,
              FightNotificationService.getMissHTML()
            );
          }, 500);
          break;

        default:
          break;
      }

      // Después de la acción principal, procesamos los efectos secundarios (healings)
      if (healings?.length > 0) {
        // El healing siempre se aplica al luchador que realiza la acción
        const healingTargetSelector = isPlayerTurn ? 'player' : 'enemy';
        healings.forEach((healing, index) => {
          setTimeout(() => {
            this.showHealingNumber(healingTargetSelector, healing.healing);
          }, 1000 + (index * 200)); // Empezamos después de la acción principal y espaciamos múltiples healings
        });
        totalAnimationTime = Math.max(totalAnimationTime, 1000 + (healings.length * 200));
      }

      // Resolver la promesa después de que terminen todas las animaciones
      setTimeout(resolve, totalAnimationTime);
    });
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

  private showHealingNumber(target: 'player' | 'enemy', amount: number) {
    const targetElement = document.querySelector(`.${target}-image`);
    if (!targetElement) return;

    const healingElement = document.createElement('div');
    healingElement.className = 'damage-number healing';
    healingElement.textContent = `+${amount}`;

    const rect = targetElement.getBoundingClientRect();
    healingElement.style.left = `${rect.left + rect.width / 2}px`;
    healingElement.style.top = `${rect.top + rect.height / 3}px`;

    document.body.appendChild(healingElement);

    setTimeout(() => {
      if (document.body.contains(healingElement)) {
        document.body.removeChild(healingElement);
      }
    }, 1500);
  }
}
