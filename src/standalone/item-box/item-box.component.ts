import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgOptimizedImage } from '@angular/common';
@Component({
  selector: 'app-item-box',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, NgOptimizedImage],
  templateUrl: './item-box.component.html',
  styleUrl: './item-box.component.scss',
})
export class ItemBoxComponent {
  @Input() height = 30;
  @Input() width = 30;
  @Input() image: string = null;
}
