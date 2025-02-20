import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-crypt-tutorial',
  templateUrl: './crypt-tutorial.component.html',
  styleUrl: './crypt-tutorial.component.scss',
})
export class CryptTutorialComponent {
  public prefix = ViewportService.getPreffixImg();
}
