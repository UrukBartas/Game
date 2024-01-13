import { Component, HostListener, inject } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { InventoryService } from 'src/services/inventory.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrl: './character.component.scss',
})
export class CharacterComponent extends TemplatePage {
  private inventoryService = inject(InventoryService);
  private viewportService = inject(ViewportService);
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public consumablesInventoryBoxes =
    this.inventoryService.getInventoryStructure(20);

  public obtainEquippedItemBoxHeightDependingOnScreenSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 70;
    }
    return 140;
  }

  public obtainEquippedItemBoxWidthDependingOnScreenSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 62.5;
    }
    return 125;
  }
}
