import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-shop-tutorial',
  templateUrl: './shop-tutorial.component.html',
  styleUrl: './shop-tutorial.component.scss'
})
export class ShopTutorialComponent {
  public prefix = ViewportService.getPreffixImg();
}
