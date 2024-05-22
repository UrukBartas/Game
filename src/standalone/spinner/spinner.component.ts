import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div
      [style.width]="size"
      [style.height]="size"
      [style.max-height]="maxSize"
      [style.max-width]="maxSize"
      class="spinner-container"
    >
      <div
        class="spinner"
        [style.--color]="color"
        [style.--border]="border"
      ></div>
    </div>
  `,
  styleUrl: './spinner.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class SpinnerComponent {
  @Input() color = 'white';
  @Input() border = '4px';
  @Input() size = '50px';
  @Input() maxSize = '10vh';
}
