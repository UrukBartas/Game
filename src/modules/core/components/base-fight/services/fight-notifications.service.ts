import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FightNotificationService {
  private renderer: Renderer2;
  private notificationQueues: { [key: string]: HTMLElement[] } = {};

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  showNotification(cssSelector: string, htmlContent: string) {
    const element = document.querySelector(cssSelector);
    if (!element) {
      console.error(`Element with selector "${cssSelector}" not found.`);
      return;
    }

    const notification = this.createNotificationElement(htmlContent);
    if (!this.notificationQueues[cssSelector]) {
      this.notificationQueues[cssSelector] = [];
    }

    this.notificationQueues[cssSelector].push(notification);

    if (this.notificationQueues[cssSelector].length === 1) {
      this.processQueue(cssSelector, element);
    }
  }

  private createNotificationElement(htmlContent: string): HTMLElement {
    const notification = this.renderer.createElement('div');
    this.renderer.setStyle(notification, 'position', 'absolute');
    this.renderer.setStyle(notification, 'opacity', '0');
    this.renderer.setStyle(notification, 'transform', 'translateY(20vh)');
    this.renderer.setStyle(
      notification,
      'transition',
      'opacity 0.3s linear, transform 0.5s ease-in-out'
    );
    this.renderer.addClass(notification, 'combat-notification');
    this.renderer.setProperty(notification, 'innerHTML', htmlContent);
    return notification;
  }

  private async processQueue(cssSelector: string, container: Element) {
    const queue = this.notificationQueues[cssSelector];
  
    while (queue.length > 0) {
      const notification = queue[0];
      this.renderer.appendChild(container, notification);
  
      await this.animateNotification(notification);
  
      this.renderer.removeChild(container, notification);
      queue.shift();
    }
  }
  
  private animateNotification(notification: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      this.renderer.setStyle(notification, 'opacity', '0');
      this.renderer.setStyle(notification, 'transform', 'translateY(20vh)');
      this.renderer.setStyle(notification, 'position', 'absolute');
      this.renderer.setStyle(notification, 'transition', 'opacity 0.3s linear, transform 0.5s ease-in-out');
  
      setTimeout(() => {
        this.renderer.setStyle(notification, 'opacity', '1');
        this.renderer.setStyle(notification, 'transform', 'translateY(0)');
      }, 0);
  
      setTimeout(() => {
        this.renderer.setStyle(notification, 'opacity', '0');
      }, 750);
  
      setTimeout(() => resolve(), 1000);
    });
  }

  static getDamageHtml(damage: number): string {
    return `
    <div class="d-flex align-items-center gap-1">
        <div class="fa-sword"></div><span>${damage}</span>
    </div>
    `;
  }

  static getCritDamageHtml(damage: number): string {
    return `
    <div class="d-flex align-items-center text-warning gap-1">
        <div class="fa-sword"></div><span>${damage}</span>
    </div>
    `;
  }

  static getBlockHTML(): string {
    return `
    <div class="d-flex align-items-center gap-1">
        <i class="fa fa-shield"></i> Blocked!
    </div>
    `;
  }

  static getMissHTML(): string {
    return `
    <div class="d-flex align-items-center gap-1">
        <i class="fa fa-person-falling-burst"></i> Miss!
    </div>
    `;
  }
}
