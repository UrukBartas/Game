import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class ProgressBarComponent {
  @Input() text: string;
  @Input() barClass: string;
  @Input() percentage: string;
}
