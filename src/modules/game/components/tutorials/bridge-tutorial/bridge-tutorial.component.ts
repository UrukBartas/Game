import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-bridge-tutorial',
  templateUrl: './bridge-tutorial.component.html',
  styleUrl: './bridge-tutorial.component.scss',
})
export class BridgeTutorialComponent {
  public prefix = ViewportService.getPreffixImg();
}
