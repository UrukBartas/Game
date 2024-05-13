import { Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  getAccount,
  getNetwork,
  switchNetwork,
  watchNetwork,
} from '@wagmi/core';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  EMPTY,
  catchError,
  filter,
  firstValueFrom,
  from,
  interval,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { shimmerTestnet, shimmer } from 'viem/chains';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Item } from 'src/modules/core/models/items.model';
import { ContractService } from 'src/services/contract.service';
import { ExportImportService } from 'src/services/export-import.service';
import { InventoryService } from 'src/services/inventory.service';
import { ItemService } from 'src/services/item.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import {
  WalletService,
  allowedChains,
  getChainById,
} from 'src/services/wallet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-export-import-nft',
  templateUrl: './export-import-nft.component.html',
  styleUrl: './export-import-nft.component.scss',
})
export class ExportImportNftComponent extends TemplatePage {
  public exportTypeActive: 'export' | 'import' = 'export';
  public exportingObjectTypeActive: 'nft' | 'coins' = 'nft';

  public selectedUruksToExport = 0;
  private playerService = inject(PlayerService);
  viewportService = inject(ViewportService);
  contractService = inject(ContractService);
  itemService = inject(ItemService);
  importExport = inject(ExportImportService);
  spinnerService = inject(NgxSpinnerService);
  toastService = inject(ToastrService);
  store = inject(Store);
  walletService = inject(WalletService);
  public compatibleChains = this.getChainList();
  public activeNetworkId = signal(getNetwork().chain.id);
  public activeCorrectNetwork = computed(() => {
    return of(this.activeNetworkId()).pipe(filter((entry) => !!entry));
  });
  player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));

  erc20Balance$ = new BehaviorSubject([]);
  erc20BalanceInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return from(
        this.contractService.executeReadContractOnUrukERC20('balanceOf', [
          getAccount().address,
        ])
      ).pipe(
        catchError((err) => {
          console.error(err);
          return err;
        }),
        map((entry) => {
          return Number(ethers.formatEther(entry.toString())).toFixed(8);
        })
      );
    })
  );

  public selectedMultipleItems: Item[] = [];

  public getERC20ExportFee$ = this.activeCorrectNetwork().pipe(
    switchMap(() => {
      return from(
        this.contractService.executeReadContractOnUrukERC20(
          'getExportFee',
          null
        )
      ).pipe(
        map((entry) => Number(ethers.formatEther(entry.toString())).toFixed(8))
      );
    })
  );

  public getNFTExportFee$ = this.activeCorrectNetwork().pipe(
    switchMap(() => {
      return from(
        this.contractService.executeReadContractOnUrukNFT('getMintingFee', null)
      ).pipe(
        map((entry) => Number(ethers.formatEther(entry.toString())).toFixed(8))
      );
    })
  );

  public currentSize$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry.player.sockets)
  );

  public get selectedItem() {
    return this.selectedMultipleItems ? this.selectedMultipleItems[0] : null;
  }

  public whiteListedItems$ = new BehaviorSubject([]);
  public whiteListedItemsInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.contractService.executeReadContractOnUrukNFT(
        'getItemsWhitelisted',
        [getAccount().address + '']
      );
    }),
    switchMap((entry: any) => {
      const realTypeEntry = entry as Array<BigInt>;
      const toNumbers = realTypeEntry.map((entry) => Number(entry.toString()));
      return this.itemService.getMultipleItemsAtOnce({ ids: toNumbers }).pipe(
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
    })
  );

  public currentInventory$ = new BehaviorSubject([]);
  public currentInventoryInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.playerService.getItems().pipe(
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
    })
  );

  public currentInventoryOfNfts$ = new BehaviorSubject([]);
  public currentInventoryOfNftsInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.playerService.getNFTS().pipe(
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
    })
  );

  public refreshPlayer$ = interval(5000).pipe(
    tap(() => {
      this.store.dispatch(new RefreshPlayer());
    })
  );

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
    this.refreshPlayer$.pipe(takeUntilDestroyed()).subscribe();
  }

  ngOnInit(): void {}

  public getChainList() {
    if (environment.production) {
      return allowedChains.filter((entry) => entry.id == shimmer.id);
    } else {
      return allowedChains.filter((entry) => entry.id == shimmerTestnet.id);
    }
  }

  ngAfterViewInit(): void {
    watchNetwork((network) => {
      const isAllowed = this.compatibleChains.find(
        (chain) => chain.id == network.chain.id
      );
      if (!!isAllowed) {
        this.activeNetworkId.set(network.chain.id);
      } else {
        this.activeNetworkId.set(0);
      }
    });
  }

  public getActiveNetworkImg() {
    if (this.activeNetworkId() != 0) {
      const chain = this.compatibleChains.find(
        (chain) => chain.id == this.activeNetworkId()
      );
      if (chain) return chain.img;
    }
    return null;
  }

  public changeNetwork(chainId: number) {
    switchNetwork({ chainId });
  }

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
    this.selectedMultipleItems = [];
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
      const fees = await firstValueFrom(this.getNFTExportFee$);
      await this.contractService.executewriteContractOnUrukNFT(
        'exportItemToNft',
        [staticItemfornow.id + '', `ipfs://${uploadJsonMetadataNFTCID.cid}`],
        ethers.parseEther(fees)
      );
      this.spinnerService.hide();
      this.toastService.success(
        'The item got exported, you will receive your NFT in your wallet soon!'
      );
      this.selectedMultipleItems = [];
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? error?.cause?.reason ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  public async addAssetToWallet() {
    this.toastService.info('Discovering NFT in wallet, can take a while...');
    await (window.ethereum as any).request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: {
          address: getChainById(getNetwork().chain.id).NFT,
          tokenId: this.selectedMultipleItems[0].id + '',
        },
      },
    });
  }

  public async addERC20ToWallet() {
    await (window.ethereum as any).request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: getChainById(getNetwork().chain.id).ERC20,
        },
      },
    });
  }

  public async triggerActionForNFT() {
    this.spinnerService.show();
    try {
      if (this.exportTypeActive == 'export') {
        const staticItemfornow = await firstValueFrom(
          this.itemService.getItem(this.selectedMultipleItems[0].id)
        );

        await firstValueFrom(
          this.importExport.whiteListItem(
            staticItemfornow.id + '',
            getAccount().address
          )
        );

        this.exportItem(this.selectedMultipleItems[0].id);
      } else {
        await this.contractService.executewriteContractOnUrukNFT(
          'importNftToItem',
          [this.selectedMultipleItems[0].id + '']
        );
        this.spinnerService.hide();
        this.selectedMultipleItems = [];
        this.toastService.success(
          'The item got imported, you will receive your item in your in-game inventory soon!'
        );
      }
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? error?.cause?.reason ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  public async triggerActionForERC20() {
    this.spinnerService.show();
    try {
      if (this.exportTypeActive == 'export') {
        await firstValueFrom(
          this.importExport.whiteListItemERC20(
            this.selectedUruksToExport,
            getAccount().address
          )
        );
        const fees = await firstValueFrom(this.getERC20ExportFee$);
        await this.contractService.executewriteContractOnUrukERC20(
          'exportCoins',
          [ethers.parseEther(this.selectedUruksToExport.toString())],
          ethers.parseEther(fees)
        );
        this.spinnerService.hide();
        this.toastService.success(
          'The coins got exported, you will receive them in your wallet soon!'
        );
        this.selectedUruksToExport = 0;
      } else {
        await this.contractService.executewriteContractOnUrukERC20(
          'importCoins',
          [ethers.parseEther(this.selectedUruksToExport.toString())]
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
        error?.error?.message ?? error?.cause?.reason ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  public async cancelPendingExport(idItem: number) {
    this.spinnerService.show();
    try {
      await this.contractService.executewriteContractOnUrukNFT(
        'deletePendingExport',
        [idItem]
      );
      this.spinnerService.hide();
      this.toastService.success('Success');
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
