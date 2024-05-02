import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-blacksmith-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blacksmith-context-menu.component.html',
  styleUrl: './blacksmith-context-menu.component.scss'
})
export class BlacksmithContextMenuComponent {
  @Output() anvilIt = new EventEmitter<void>();
}
