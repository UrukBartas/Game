import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-item-box',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './item-box.component.html',
  styleUrl: './item-box.component.scss',
})
export class ItemBoxComponent {
  @Input() height = 30;
  @Input() width = 30;
  @Input() image: string = null;
  @Input() active = false;
  @Input() displayTooltip = true;
  @Input() stack: number = 0;
}
