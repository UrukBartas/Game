import { Injectable, TemplateRef, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ContextMenuService {
  public menuVisible = signal(false);
  public top = signal(0);
  public left = signal(0);
  public menuContent = signal<TemplateRef<any>>(null);
  public context = signal<any>({});

  onContextMenu(
    event: MouseEvent,
    templateRef: TemplateRef<any>,
    context: any = {}
  ) {
    event.preventDefault();
    this.menuVisible.set(true);
    let posx = 0;
    let posy = 0;
    if (event.pageX || event.pageY) {
      posx = event.pageX;
      posy = event.pageY;
    } else if (event.clientX || event.clientY) {
      posx =
        event.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft;
      posy =
        event.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop;
    }
    this.context.set(context);
    this.showContextMenu(posy, posx, templateRef);
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
