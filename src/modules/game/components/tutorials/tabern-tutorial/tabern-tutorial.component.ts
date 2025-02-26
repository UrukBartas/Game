import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';
import { BaseTutorialComponent } from '../base-tutorial/base-tutorial.component';

@Component({
  selector: 'app-tabern-tutorial',
  templateUrl: './tabern-tutorial.component.html',
  styleUrl: './tabern-tutorial.component.scss'
})
export class TabernTutorialComponent extends BaseTutorialComponent {
  public prefix = ViewportService.getPreffixImg();
}
