import { Component, inject } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { InventoryService } from 'src/services/inventory.service';

@Component({
  selector: 'app-export-import-nft',
  templateUrl: './export-import-nft.component.html',
  styleUrl: './export-import-nft.component.scss',
})
export class ExportImportNftComponent extends TemplatePage {
  public typeActive: 'export' | 'import' = 'export';
  private inventoryService = inject(InventoryService);
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public allowImportExport = false;

  public changeType(event: any) {
    event.target.checked
      ? (this.typeActive = 'export')
      : (this.typeActive = 'import');
  }

  public triggerAction(): void {}
}
