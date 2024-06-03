import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FocuserService } from './focuser.service';

@Component({
  selector: 'app-focuser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focuser.component.html',
  styleUrl: './focuser.component.scss',
})
export class FocuserComponent {
  public focusService = inject(FocuserService);
}
