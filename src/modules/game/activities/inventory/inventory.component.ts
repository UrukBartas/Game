import { Component, HostListener, inject } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { InventoryService } from 'src/services/inventory.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent extends TemplatePage {
  private inventoryService = inject(InventoryService);
  private playerService = inject(PlayerService);
  viewportService = inject(ViewportService);
  public activeSlideIndex = 0;
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public consumablesInventoryBoxes =
    this.inventoryService.getInventoryStructure(20);
  public currentInventory$ = this.playerService.getItems();

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
