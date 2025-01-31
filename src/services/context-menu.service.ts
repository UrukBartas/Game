import { Injectable, TemplateRef, inject, signal } from '@angular/core';
import { ViewportService } from './viewport.service';

@Injectable({
  providedIn: 'root',
})
export class ContextMenuService {
  public menuVisible = signal(false);
  public top = signal(0);
  public left = signal(0);
  public menuContent = signal<TemplateRef<any>>(null);
  public viewportService = inject(ViewportService);
  public context = signal<any>({});

  onContextMenu(event: any, templateRef: TemplateRef<any>, context: any = {}) {
    event.preventDefault(); // Evita el menú contextual nativo en móviles

    this.menuVisible.set(true);
    let posx = 0;
    let posy = 0;

    if (this.isTouchDevice()) {
      posx = event.center?.x || 0;
      posy = event.center?.y || 0;
    } else {
      posx = event.pageX || 0;
      posy = event.pageY || 0;
    }

    this.context.set(context);
    this.showContextMenu(posy, posx, templateRef);
  }

  // Método para detectar si el usuario está en un dispositivo táctil
  public isTouchDevice(): boolean {
    return (
      (['xs', 'sm'].includes(this.viewportService.screenSize) &&
        'ontouchstart' in window) ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  private showContextMenu(
    top: number,
    left: number,
    content: TemplateRef<any>
  ) {
    this.menuVisible.set(true);
    this.top.set(top);
    this.left.set(left);
    this.menuContent.set(content);
  }

  hideContextMenu() {
    this.menuVisible.set(false);
  }

  getMenuState() {
    return {
      visible: this.menuVisible,
      top: this.top,
      left: this.left,
      content: this.menuContent,
      context: this.context,
    };
  }
}
