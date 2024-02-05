import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { getAccount } from '@wagmi/core';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  delay,
  expand,
  firstValueFrom,
  forkJoin,
  from,
  interval,
  map,
  of,
  retry,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Item } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ContractService } from 'src/services/contract.service';
import { ExportImportService } from 'src/services/export-import.service';
import { InventoryService } from 'src/services/inventory.service';
import { ItemService } from 'src/services/item.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-export-import-nft',
  templateUrl: './export-import-nft.component.html',
  styleUrl: './export-import-nft.component.scss',
})
export class ExportImportNftComponent extends TemplatePage {
  public exportTypeActive: 'export' | 'import' = 'export';
  public exportingObjectTypeActive: 'nft' | 'coins' = 'nft';
  public selectedUruksToExport = 0;
  private inventoryService = inject(InventoryService);
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  private playerService = inject(PlayerService);
  viewportService = inject(ViewportService);
  contractService = inject(ContractService);
  itemService = inject(ItemService);
  importExport = inject(ExportImportService);
  spinnerService = inject(NgxSpinnerService);
  toastService = inject(ToastrService);
  store = inject(Store);
  player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));

  erc20Balance$ = new BehaviorSubject([]);
  erc20BalanceInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return from(
        this.contractService.activeContractERC20['balanceOf'](
          getAccount().address
        )
      ).pipe(
        map((entry) => {
          return Number(ethers.formatEther(entry.toString())).toFixed(8);
        })
      );
    })
  );

  public selectedItem: Item;

  public whiteListedItems$ = new BehaviorSubject([]);
  public whiteListedItemsInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.contractService.executeReadContractOnUrukNFT(
        'getItemsWhitelisted',
        [getAccount().address + '']
      );
    })
  );

  public currentInventory$ = new BehaviorSubject([]);
  public currentInventoryInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.playerService.getItems();
    })
  );

  public currentInventoryOfNfts$ = new BehaviorSubject([]);
  public currentInventoryOfNftsInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.playerService.getNFTS();
    })
  );

  public updatePlayer$ = interval(5000).pipe(
    tap(() => {
      this.store.dispatch(new RefreshPlayer());
    })
  );

  public parseToAny = (anything: any) => anything as any;

  constructor() {
    super();
    this.whiteListedItemsInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => this.whiteListedItems$.next(data));
    this.currentInventoryInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => this.currentInventory$.next(data));
    this.currentInventoryOfNftsInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => {
        this.currentInventoryOfNfts$.next(data);
      });
    this.erc20BalanceInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => {
        this.erc20Balance$.next(data);
      });
    this.updatePlayer$.pipe(takeUntilDestroyed()).subscribe();
  }

  ngOnInit(): void {}

  public async assignValueToSelectedUruks(factor: number) {
    const player = await firstValueFrom(this.player$);
    const erc20Balance = await firstValueFrom(this.erc20Balance$);
    this.selectedUruksToExport =
      (this.exportTypeActive == 'export'
        ? player.uruks
        : Number(erc20Balance)) * factor;
  }

  public changeType(event: any) {
    event.target.checked
      ? (this.exportTypeActive = 'export')
      : (this.exportTypeActive = 'import');
    this.selectedItem = null;
    this.selectedUruksToExport = 0;
  }

  public async exportItem(id: number) {
    this.spinnerService.hide();
    this.spinnerService.show();
    try {
      const staticItemfornow = await firstValueFrom(
        this.itemService.getItem(id)
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
      this.selectedItem = null;
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  public async triggerActionForNFT() {
    this.spinnerService.show();
    try {
      if (this.exportTypeActive == 'export') {
        const staticItemfornow = await firstValueFrom(
          this.itemService.getItem(this.selectedItem.id)
        );

        await firstValueFrom(
          this.importExport.whiteListItem(
            staticItemfornow.id + '',
            getAccount().address
          )
        );

        this.exportItem(this.selectedItem.id);
      } else {
        await this.contractService.executewriteContractOnUrukNFT(
          'importNftToItem',
          [this.selectedItem.id + '']
        );
        this.spinnerService.hide();
        this.selectedItem = null;
        this.toastService.success(
          'The item got imported, you will receive your item in your in-game inventory soon!'
        );
      }
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  public async triggerActionForERC20() {
    this.spinnerService.show();
    const selectedAmount = Math.ceil(this.selectedUruksToExport);
    try {
      if (this.exportTypeActive == 'export') {
        await firstValueFrom(
          this.importExport.whiteListItemERC20(
            selectedAmount,
            getAccount().address
          )
        );
        await this.contractService.executewriteContractOnUrukERC20(
          'exportCoins',
          [ethers.parseEther(selectedAmount.toString())]
        );
        this.spinnerService.hide();
        this.toastService.success(
          'The coins got exported, you will receive them in your wallet soon!'
        );
        this.selectedUruksToExport = 0;
      } else {
        await this.contractService.executewriteContractOnUrukERC20(
          'importCoins',
          [ethers.parseEther(selectedAmount.toString())]
        );
        this.spinnerService.hide();
        this.toastService.success(
          'The coins got imported, you will receive them in your inventory soon!'
        );
        this.selectedUruksToExport = 0;
      }
    } catch (error: any) {
      console.error(error);
      this.toastService.error(
        error?.error?.message ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }
}
