import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-inventory-tutorial',
  templateUrl: './inventory-tutorial.component.html',
  styleUrl: './inventory-tutorial.component.scss',
})
export class InventoryTutorialComponent {
  public prefix = ViewportService.getPreffixImg();
}
