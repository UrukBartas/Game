import { Component, inject } from '@angular/core';
import {
  getAccount,
  waitForTransaction,
  watchContractEvent,
} from '@wagmi/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, forkJoin, switchMap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { RarityEnum, TraitsEnum } from 'src/modules/core/models/items.enum';
import { ContractService } from 'src/services/contract.service';
import { ExportImportService } from 'src/services/export-import.service';
import { InventoryService } from 'src/services/inventory.service';
import { ItemService } from 'src/services/item.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';

@Component({
  selector: 'app-export-import-nft',
  templateUrl: './export-import-nft.component.html',
  styleUrl: './export-import-nft.component.scss',
})
export class ExportImportNftComponent extends TemplatePage {
  public typeActive: 'export' | 'import' = 'export';
  private inventoryService = inject(InventoryService);
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public allowImportExport = true;
  viewportService = inject(ViewportService);
  contractService = inject(ContractService);
  itemService = inject(ItemService);
  importExport = inject(ExportImportService);
  spinnerService = inject(NgxSpinnerService);
  toastService = inject(ToastrService);

  public changeType(event: any) {
    event.target.checked
      ? (this.typeActive = 'export')
      : (this.typeActive = 'import');
  }

  public async triggerAction() {
    const ITEM_ID = 4;
    this.spinnerService.show();
    if (this.typeActive == 'export') {
      //[TODO] display whitelisted items but not exported
      try {
        const staticItemfornow = await firstValueFrom(
          this.itemService.getItem(ITEM_ID)
        );

        await firstValueFrom(
          this.importExport.whiteListItem(
            staticItemfornow.id + '',
            getAccount().address
          )
        );

        const uploadJsonMetadataNFTCID = (await firstValueFrom(
          this.importExport.uploadJsonMetadataNFT(staticItemfornow)
        )) as { cid: string };

        await this.contractService.executewriteContractOnUrukNFT(
          'exportItemToNft',
          [staticItemfornow.id + '', `ipfs://${uploadJsonMetadataNFTCID.cid}`]
        );
        this.spinnerService.hide();
        this.toastService.success(
          'The item got exported, you will receive your NFT in your wallet soon!'
        );
      } catch (error: any) {
        this.toastService.error(
          error?.error?.message ?? undefined,
          'Something went wrong'
        );
        this.spinnerService.hide();
      }
    } else {
      try {
        await this.contractService.executewriteContractOnUrukNFT(
          'importNftToItem',
          [ITEM_ID + '']
        );
        this.spinnerService.hide();
        this.toastService.success(
          'The item got imported, you will receive your item in your in-game inventory soon!'
        );
      } catch (error: any) {
        this.toastService.error(
          error?.error?.message ?? undefined,
          'Something went wrong'
        );
        this.spinnerService.hide();
      }
    }
  }
}
