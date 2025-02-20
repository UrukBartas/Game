import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-blacksmith-tutorial',
  templateUrl: './blacksmith-tutorial.component.html',
  styleUrl: './blacksmith-tutorial.component.scss',
})
export class BlacksmithTutorialComponent {
  public prefix = ViewportService.getPreffixImg();
}
