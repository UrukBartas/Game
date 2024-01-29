import { Component, inject } from '@angular/core';
import { getAccount, waitForTransaction } from '@wagmi/core';
import { firstValueFrom, forkJoin, switchMap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { RarityEnum, TraitsEnum } from 'src/modules/core/models/items.enum';
import { ContractService } from 'src/services/contract.service';
import { InventoryService } from 'src/services/inventory.service';
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

  testItem = {
    id: 9, // backenduid
    name: 'Casco Épico',
    image: 'ipfs://bafkreifdspa6n2dbbeqm3clchqbmjceq2eum4jpeiet77ysanegscaor44',
    rarity: RarityEnum.MYTHIC,
    level: 5,
    playerId: 'jugador123',
    armor: 50,
    health: 100,
    accuracy: 90,
    trait: TraitsEnum.HOLY,
  };

  public changeType(event: any) {
    event.target.checked
      ? (this.typeActive = 'export')
      : (this.typeActive = 'import');
  }

  public async triggerAction() {
    if (this.typeActive == 'export') {
      await firstValueFrom(
        this.contractService.whiteListItem(
          this.testItem.id + '',
          getAccount().address
        )
      );

      const uploadJsonMetadataNFTCID = (await firstValueFrom(
        this.contractService.uploadJsonMetadataNFT(this.testItem)
      )) as { cid: string };

      const txHash = await this.contractService.executewriteContractOnUrukNFT(
        'exportItemToNft',
        [
          this.testItem.id + '', //unique backend id
          `ipfs://${uploadJsonMetadataNFTCID.cid}`,
        ]
      );
      //[TODO]
      //Escuchar completación en el back y que cuando lo haga ponga el item enabled a false y playerId a null
      //Tambien cuando termine que envie una respuesta/evento al front para que se informe
    } else {
      const data = await this.contractService.executewriteContractOnUrukNFT(
        'importNftToItem',
        [2 + ''] // 1 es el token id del token en el SC
      );
      const result = await waitForTransaction({
        hash: data?.hash,
      });
      console.log(result); //hash
      //[TODO]
      //Buscar el item en la BD por backenduid que vendrá dado por el NFT y ponerle enable a true y el playerID que toque
    }
  }
}
