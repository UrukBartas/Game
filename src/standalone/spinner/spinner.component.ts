import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="spinner-container">
      <div class="spinner" [style.--color]="color"></div>
    </div>
  `,
  styleUrl: './spinner.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class SpinnerComponent {
  @HostBinding('class') class = 'w-fit';
  @Input() color = 'white';
}
