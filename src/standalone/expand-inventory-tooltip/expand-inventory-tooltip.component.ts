import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Rarity } from 'src/modules/core/models/items.model';
import { getRarityColor, getRarityText } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-expand-inventory-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expand-inventory-tooltip.component.html',
  styleUrl: './expand-inventory-tooltip.component.scss',
})
export class ExpandInventoryTooltipComponent {
  public getRarityColor = getRarityColor;
  public getRarityText = getRarityText;
  public viewportService = inject(ViewportService);
  public prefix = ViewportService.getPreffixImg();
  @Input() currentLevelInventory = 4;
  @Input() cost = 100;

  ngOnInit(): void {}

  public RarityEnum = Rarity;

  public getItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 100;
    }
    return 200;
  }


}
