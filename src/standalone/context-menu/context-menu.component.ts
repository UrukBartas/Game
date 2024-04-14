import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  inject,
} from '@angular/core';
import { ContextMenuService } from 'src/services/context-menu.service';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
})
export class ContextMenuComponent {
  @Output() closed = new EventEmitter<void>();
  contextMenuService = inject(ContextMenuService);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.contextMenuService.menuVisible()) return;
    const targetElement = event.target as HTMLElement;
    if (!this.isInsideMenu(targetElement)) {
      this.closeMenu();
    }
  }

  private isInsideMenu(targetElement: HTMLElement): boolean {
    const menuElement = document.getElementById('contextMenu');
    return menuElement?.contains(targetElement);
  }

  closeMenu() {
    this.contextMenuService.menuVisible.set(false);
    this.closed.emit();
  }
}
