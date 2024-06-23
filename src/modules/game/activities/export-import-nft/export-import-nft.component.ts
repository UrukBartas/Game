import { Component, effect, inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  getAccount,
  getNetwork,
  switchNetwork,
  waitForTransaction,
  watchNetwork,
} from '@wagmi/core';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  filter,
  firstValueFrom,
  forkJoin,
  from,
  interval,
  map,
  of,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { shimmerTestnet, shimmer } from 'viem/chains';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Item, ItemType } from 'src/modules/core/models/items.model';
import { ContractService } from 'src/services/contract.service';
import { ExportImportService } from 'src/services/export-import.service';
import { ItemService } from 'src/services/item.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { WalletService } from 'src/services/wallet.service';
import { FormControl } from '@angular/forms';
import { ItemTypeSC } from './enums/ItemTypesSC';
import { NavigationEnd, Router } from '@angular/router';
import { Material } from 'src/modules/core/models/material.model';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { MiscellanyItem } from 'src/modules/core/models/misc.model';
import { getItemTypeSCBasedOnItem } from 'src/modules/utils';
import { StackPipe } from 'src/modules/core/pipes/stack.pipe';

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
  router = inject(Router);
  walletService = inject(WalletService);
  stack = inject(StackPipe);

  public activeNetworkId = new BehaviorSubject<number>(0);
  public activeCorrectNetwork = this.activeNetworkId.pipe(
    filter((entry) => !!entry)
  );

  public get allSelectedItems() {
    return [
      ...(this.selectedMultipleItems.map((entry) => {
        entry['exportType'] = ItemTypeSC.Item;
        return entry;
      }) ?? []),
      ...(this.selectedMultipleMaterials.map((entry) => {
        entry['exportType'] = ItemTypeSC.Material;
        return entry;
      }) ?? []),
      ...(this.selectedMultipleConsumables.map((entry) => {
        entry['exportType'] = ItemTypeSC.Potion;
        return entry;
      }) ?? []),
      ...(this.selectedMultipleMiscellany.map((entry) => {
        entry['exportType'] = ItemTypeSC.Miscellaneous;
        return entry;
      }) ?? []),
    ];
  }

  createIntervalObservable<T>(
    intervalTime: number,
    source$: Observable<T>
  ): Observable<T> {
    return interval(intervalTime).pipe(
      startWith(0),
      switchMap(() =>
        source$.pipe(
          catchError((err) => {
            console.error(err);
            return EMPTY;
          })
        )
      )
    );
  }

  player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));

  erc20Balance$ = new BehaviorSubject([]);
  erc20BalanceInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.walletService.getValidAddress$;
    }),
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
  public selectedMultipleMaterials: Material[] = [];
  public selectedMultipleConsumables: Consumable[] = [];
  public selectedMultipleMiscellany: MiscellanyItem[] = [];
  public getItemTypeSCBasedOnItem = getItemTypeSCBasedOnItem;

  public getERC20ExportFee$ = this.activeCorrectNetwork.pipe(
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

  public getNFTExportFee$ = this.activeCorrectNetwork.pipe(
    switchMap(() => {
      return from(
        this.contractService.executeReadContractOnUrukNFT('getMintingFee', null)
      ).pipe(
        map((entry) => {
          return Number(ethers.formatEther(entry.toString()));
        })
      );
    })
  );

  public calculateFeesBasedOnSelectedItems(
    baseFee: number,
    itemsNumber?: number
  ) {
    return (baseFee * (itemsNumber ?? this.allSelectedItems.length)).toFixed(8);
  }

  public currentSize$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry.player.sockets)
  );

  public whiteListedItems$ = new BehaviorSubject([]);
  public whiteListedItemsInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.walletService.getValidAddress$;
    }),
    switchMap((address) => {
      return this.contractService.executeReadContractOnUrukNFT(
        'getItemsWhitelisted',
        [address]
      );
    }),
    switchMap((entry: { id: number; itemType: ItemTypeSC; uri: string }[]) => {
      const itemsParsed = entry.map((entry) => {
        entry.id = Number(entry.id.toString());
        entry.itemType = Number(entry.itemType.toString());
        return entry;
      });
      return this.itemService
        .getMultipleItemsAtOnce({
          ids: itemsParsed.map((entry) => entry.id),
          itemTypes: itemsParsed.map((entry) => entry.itemType),
        })
        .pipe(
          catchError((err) => {
            console.error(err);
            return EMPTY;
          })
        );
    })
  );

  public currentInventory$ = new BehaviorSubject([]);
  public currentInventoryInterval$ = this.createIntervalObservable(
    5000,
    this.playerService.getItems()
  );

  public currentInventoryMaterials$ = new BehaviorSubject([]);
  public currentInventoryMaterialsInterval$ = this.createIntervalObservable(
    5000,
    this.playerService.getItemsMaterial()
  );

  public currentInventoryConsumables$ = new BehaviorSubject([]);
  public currentInventoryConsumablesInterval$ = this.createIntervalObservable(
    5000,
    this.playerService.getItemsConsumable()
  );

  public currentInventoryMiscellany$ = new BehaviorSubject([]);
  public currentInventoryMiscellanyInterval$ = this.createIntervalObservable(
    5000,
    this.playerService.getMiscellanyItems()
  );

  private filterAndMapNfts(itemType: ItemTypeSC) {
    return map((nfts: Array<any>) => {
      let filtered = nfts.filter((nft) => nft.itemType === itemType);
      return filtered.map((filteredEntry) => {
        let entry = { ...filteredEntry, ...filteredEntry.dbItem };
        if (itemType == ItemTypeSC.Material)
          entry.quantity = filteredEntry.quantity;
        return entry;
      });
    });
  }

  public currentInventoryOfNfts$ = new BehaviorSubject([]);
  public currentInventoryOfNftsInterval$ = this.createIntervalObservable(
    5000,
    this.playerService.getNFTS()
  );

  public currentInventoryOfNftsItems$ = this.currentInventoryOfNfts$.pipe(
    this.filterAndMapNfts(ItemTypeSC.Item)
  );

  public currentInventoryOfNftsConsumables$ = this.currentInventoryOfNfts$.pipe(
    this.filterAndMapNfts(ItemTypeSC.Potion)
  );

  public currentInventoryOfNftsMaterials$ = this.currentInventoryOfNfts$.pipe(
    this.filterAndMapNfts(ItemTypeSC.Material)
  );

  public currentInventoryOfNftsMiscellany$ = this.currentInventoryOfNfts$.pipe(
    this.filterAndMapNfts(ItemTypeSC.Miscellaneous)
  );

  public refreshPlayer$ = this.createIntervalObservable(
    5000,
    this.store.dispatch(new RefreshPlayer())
  );

  constructor() {
    super();
    this.whiteListedItemsInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => this.whiteListedItems$.next(data));
    //ITEMS
    this.currentInventoryInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => this.currentInventory$.next(data));
    this.currentInventoryOfNftsInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => {
        this.currentInventoryOfNfts$.next(data);
      });
    //MATERIALS
    this.currentInventoryMaterialsInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this.currentInventoryMaterials$.next(data));
    //CONSUMABLE
    this.currentInventoryConsumablesInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this.currentInventoryConsumables$.next(data));
    //MISC
    this.currentInventoryMiscellanyInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this.currentInventoryMiscellany$.next(data));

    this.erc20BalanceInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => {
        this.erc20Balance$.next(data);
      });
    this.refreshPlayer$.pipe(takeUntilDestroyed()).subscribe();
    this.walletService.getValidAddress$.subscribe(() => {
      this.activeNetworkId.next(getNetwork()?.chain?.id);
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeNetworkId.next(getNetwork()?.chain?.id);
      }
    });
  }

  ngOnInit(): void {
    this.walletService.getValidAddress$.subscribe(() => {
      watchNetwork((network) => {
        try {
          const isAllowed = this.walletService.chains
            .getValue()
            .find((chain) => chain.id == network.chain.id);
          if (!!isAllowed) {
            this.activeNetworkId.next(network.chain.id);
          } else {
            this.activeNetworkId.next(0);
          }
        } catch (error) {
          this.activeNetworkId.next(0);
        }
      });
    });
  }

  public isAllowedNetwork(chainId: number) {
    return this.walletService.chains
      .getValue()
      .find((chain) => chain.id == chainId);
  }

  public getActiveNetworkImg() {
    if (this.activeNetworkId.getValue() != 0) {
      const chain = this.walletService.chains
        .getValue()
        .find((chain) => chain.id == this.activeNetworkId.getValue());
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
    this.sendThemToTheAbyssAndBurnThemLikeJs();
    this.selectedUruksToExport = 0;
  }

  public async exportItems(
    ids: number[],
    itemTypes: ItemTypeSC[],
    quantities: number[]
  ) {
    this.spinnerService.hide();
    this.spinnerService.show();

    try {
      const nftsUploaded = await firstValueFrom(
        forkJoin(
          ids.map((id, index) => {
            return this.importExport
              .uploadJsonMetadataNFT({ id: id, type: itemTypes[index] })
              .pipe(
                map((result) => {
                  return {
                    id: id,
                    cid: result.cid,
                    type: itemTypes[index],
                    quantity: quantities[index],
                  };
                })
              );
          })
        )
      );
      const fees = await firstValueFrom(this.getNFTExportFee$);
      const tx = await this.contractService.executewriteContractOnUrukNFT(
        'exportItemsToNfts',
        [
          nftsUploaded.map((entry) => entry.id),
          nftsUploaded.map((entry) => entry.type),
          nftsUploaded.map(
            (entry) => `https://gateway.lighthouse.storage/ipfs/${entry.cid}`
          ),
          nftsUploaded.map((entry) => entry.quantity),
        ],
        ethers.parseEther(
          this.calculateFeesBasedOnSelectedItems(fees, ids.length)
        )
      );
      const receipt = await waitForTransaction({
        hash: tx.hash,
      });
      this.spinnerService.hide();
      if (receipt.status !== 'success')
        throw new Error('Error exporting items!');
      this.toastService.success(
        'The items got exported, you will receive your NFT in your wallet soon!'
      );
      this.sendThemToTheAbyssAndBurnThemLikeJs();
    } catch (error: any) {
      this.toastService.error(
        error?.shortMessage ??
          error?.error?.message ??
          error?.cause?.reason ??
          error ??
          undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  private sendThemToTheAbyssAndBurnThemLikeJs() {
    this.selectedMultipleItems = [];
    this.selectedMultipleMaterials = [];
    this.selectedMultipleMiscellany = [];
    this.selectedMultipleConsumables = [];
  }

  public async addAssetToWallet() {
    const [finalIdsToImport] = await this.getRawSelectedItems();
    this.toastService.info(
      `Discovering ${finalIdsToImport.length} NFTs in wallet, can take a while...`
    );
    finalIdsToImport.map((id, index) => {
      (window.ethereum as any).request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: this.walletService.getChainById(getNetwork().chain.id).NFT,
            tokenId: id + '',
          },
        },
      });
    });
  }

  public async addERC20ToWallet() {
    await (window.ethereum as any).request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: this.walletService.getChainById(getNetwork().chain.id).ERC20,
        },
      },
    });
  }

  public quantityOfStackedConsumables(consumableDataId: string) {
    let fullInventoryConsumables =
      this.currentInventoryConsumables$.getValue() as Array<Consumable>;
    const foundItemsOfSameTypeConsumables = fullInventoryConsumables.filter(
      (consumable) =>
        !!consumable && consumable.consumableDataId == consumableDataId
    );
    return foundItemsOfSameTypeConsumables.length;
  }

  public quantityOfStackedMiscellany(miscellanyItemDataId: string) {
    let fullInventoryMisc =
      this.currentInventoryMiscellany$.getValue() as Array<MiscellanyItem>;
    const foundItemsOfSameTypeMisc = fullInventoryMisc.filter(
      (misc) => !!misc && misc.miscellanyItemDataId == miscellanyItemDataId
    );
    return foundItemsOfSameTypeMisc.length;
  }

  public flattenIdsAndTypesFromSelection(): [
    Array<number>,
    Array<ItemTypeSC>,
    Array<number>,
  ] {
    const flattenedArrayIds: Array<number> = [];
    const flattenedArrayTypes: Array<ItemTypeSC> = [];
    const flattenedQuantity: Array<number> = [];

    let fullInventoryMaterials =
      this.currentInventoryMaterials$.getValue() as Array<Material>;
    let fullInventoryMisc =
      this.currentInventoryMiscellany$.getValue() as Array<MiscellanyItem>;
    let fullInventoryConsumables =
      this.currentInventoryConsumables$.getValue() as Array<Consumable>;
    fullInventoryMaterials = fullInventoryMaterials.filter((entry) => !!entry);
    fullInventoryMisc = fullInventoryMisc.filter((entry) => !!entry);
    fullInventoryConsumables = fullInventoryConsumables.filter(
      (entry) => !!entry
    );

    this.allSelectedItems.forEach((selectedItem) => {
      const itemScType = selectedItem['exportType'] as ItemTypeSC;
      switch (itemScType) {
        case ItemTypeSC.Material:
          const selectedItemParsedMaterial = selectedItem as Material;
          const amountToExport =
            Number(selectedItem['quantityToExport'] ?? 1) ?? 1;
          const foundItemInArrayItems = fullInventoryMaterials.find(
            (item) =>
              selectedItemParsedMaterial.materialDataId == item.materialDataId
          );
          if (!foundItemInArrayItems)
            throw new Error('Item does not exist in your inventory!');
          if (amountToExport > foundItemInArrayItems.quantity) {
            throw new Error('You can not export more than you own!');
          }
          flattenedArrayIds.push(foundItemInArrayItems.id);
          flattenedArrayTypes.push(ItemTypeSC.Material);
          flattenedQuantity.push(amountToExport);
          break;
        case ItemTypeSC.Miscellaneous:
          const selectedItemParsedMiscellany = selectedItem as MiscellanyItem;
          const amountToExportMiscellany =
            Number(selectedItem['quantityToExport'] ?? 1) ?? 1;
          const foundItemsOfSameType = fullInventoryMisc.filter(
            (misc) =>
              misc.miscellanyItemDataId ==
              selectedItemParsedMiscellany.miscellanyItemDataId
          );
          if (foundItemsOfSameType.length == 0)
            throw new Error('Item does not exist in your inventory!');
          if (amountToExportMiscellany > foundItemsOfSameType.length) {
            throw new Error('You can not export more than you own!');
          }

          for (let i = 0; i < amountToExportMiscellany; i++) {
            flattenedArrayIds.push(foundItemsOfSameType[i].id);
            flattenedArrayTypes.push(ItemTypeSC.Miscellaneous);
            flattenedQuantity.push(1);
          }

          break;
        case ItemTypeSC.Potion:
          const selectedItemParsedConsumable = selectedItem as Consumable;
          const amountToExportConsumable =
            Number(selectedItem['quantityToExport'] ?? 1) ?? 1;
          const foundItemsOfSameTypeConsumables =
            fullInventoryConsumables.filter(
              (consumable) =>
                consumable.consumableDataId ==
                selectedItemParsedConsumable.consumableDataId
            );
          if (foundItemsOfSameTypeConsumables.length == 0)
            throw new Error('Item does not exist in your inventory!');
          if (
            amountToExportConsumable > foundItemsOfSameTypeConsumables.length
          ) {
            throw new Error('You can not export more than you own!');
          }
          for (let i = 0; i < amountToExportConsumable; i++) {
            flattenedArrayIds.push(foundItemsOfSameTypeConsumables[i].id);
            flattenedArrayTypes.push(ItemTypeSC.Potion);
            flattenedQuantity.push(1);
          }
          break;

        default:
          //Item
          flattenedArrayIds.push(selectedItem.id);
          flattenedArrayTypes.push(ItemTypeSC.Item);
          flattenedQuantity.push(1);
          break;
      }
    });
    return [flattenedArrayIds, flattenedArrayTypes, flattenedQuantity];
  }

  private async getRawSelectedItems() {
    const allNFTItems = await firstValueFrom(this.currentInventoryOfNfts$);
    const finalIdsToImport = [];
    const finalItemTypesToImport = [];
    this.allSelectedItems.forEach((selectedItem) => {
      if (
        selectedItem['itemType'] == ItemTypeSC.Potion ||
        selectedItem['itemType'] == ItemTypeSC.Miscellaneous
      ) {
        const foundNftsByType = allNFTItems.filter((nft) => {
          const sameType = nft.itemType == selectedItem['itemType'];
          const sameSubtype =
            nft?.dbItem?.miscellanyItemDataId ==
              selectedItem['dbItem']?.miscellanyItemDataId ||
            nft?.dbItem?.consumableDataId ==
              selectedItem['dbItem']?.consumableDataId;
          return sameType && sameSubtype;
        });

        foundNftsByType.forEach((entry) => {
          if (!finalIdsToImport.includes(entry.tokenId)) {
            finalIdsToImport.push(entry.tokenId);
            finalItemTypesToImport.push(entry.itemType);
          }
        });
      } else {
        finalIdsToImport.push(selectedItem['tokenId']);
        finalItemTypesToImport.push(selectedItem['itemType']);
      }
    });
    return [finalIdsToImport, finalItemTypesToImport];
  }

  public async triggerActionForNFT() {
    this.spinnerService.show();
    try {
      if (this.exportTypeActive == 'export') {
        const [
          flattenedArrayIds,
          flattenedArrayTypes,
          flattenedArrayQuantities,
        ] = this.flattenIdsAndTypesFromSelection();

        await firstValueFrom(
          this.importExport.whiteListItems(
            flattenedArrayIds,
            flattenedArrayTypes,
            flattenedArrayQuantities
          )
        );
        this.exportItems(
          flattenedArrayIds,
          flattenedArrayTypes,
          flattenedArrayQuantities
        );
      } else {
        const [finalIdsToImport, finalItemTypesToImport] =
          await this.getRawSelectedItems();
        await this.contractService.executewriteContractOnUrukNFT(
          'importNftToItem',
          [finalIdsToImport, finalItemTypesToImport]
        );
        this.spinnerService.hide();
        this.sendThemToTheAbyssAndBurnThemLikeJs();
        this.toastService.success(
          'The items got imported, you will receive your item in your in-game inventory soon!'
        );
      }
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? error?.cause?.reason ?? error ?? undefined,
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
          this.importExport.whiteListItemERC20(this.selectedUruksToExport)
        );
        const fees = await firstValueFrom(this.getERC20ExportFee$);
        const tx = await this.contractService.executewriteContractOnUrukERC20(
          'exportCoins',
          [ethers.parseEther(this.selectedUruksToExport.toString())],
          ethers.parseEther(fees)
        );
        const receipt = await waitForTransaction({
          hash: tx.hash,
        });
        this.spinnerService.hide();
        if (receipt.status !== 'success')
          throw new Error('Error exporting items!');
        this.toastService.success(
          'The coins got exported, you will receive them in your wallet soon!'
        );
        this.store.dispatch(new RefreshPlayer());
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
        this.store.dispatch(new RefreshPlayer());
        this.selectedUruksToExport = 0;
      }
    } catch (error: any) {
      this.toastService.error(
        error?.shortMessage ??
          error?.error?.message ??
          error?.cause?.reason ??
          undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  public async cancelAll(pendingItems: Array<any>) {
    this.spinnerService.show();
    try {
      await this.cancelPendingExports(
        pendingItems.map((entry) => entry.id),
        pendingItems.map((entry) => this.getItemTypeSCBasedOnItem(entry)),
        true
      );
      this.spinnerService.hide();
      this.toastService.success('Success');
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  public async moveForwardAll(pendingItems: Array<any>) {
    this.spinnerService.show();
    try {
      await this.exportItems(
        pendingItems.map((entry) => entry.id),
        pendingItems.map((entry) => this.getItemTypeSCBasedOnItem(entry)),
        pendingItems.map(() => 1)
      );
      this.spinnerService.hide();
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  public async cancelPendingExports(
    idItems: number[],
    itemsTypes: ItemTypeSC[],
    slave = false
  ) {
    if (!slave) this.spinnerService.show();
    try {
      await this.contractService.executewriteContractOnUrukNFT(
        'deletePendingExport',
        [idItems, itemsTypes]
      );
      if (!slave) {
        this.spinnerService.hide();
        this.toastService.success('Success');
      }
    } catch (error: any) {
      if (!slave) {
        this.toastService.error(
          error?.error?.message ?? undefined,
          'Something went wrong'
        );
        this.spinnerService.hide();
      }
    }
  }
}
