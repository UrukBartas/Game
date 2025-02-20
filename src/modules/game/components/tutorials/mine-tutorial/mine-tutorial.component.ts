import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-mine-tutorial',
  templateUrl: './mine-tutorial.component.html',
  styleUrl: './mine-tutorial.component.scss'
})
export class MineTutorialComponent {
  public prefix = ViewportService.getPreffixImg();
}
