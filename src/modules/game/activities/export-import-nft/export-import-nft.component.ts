import { Component, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  getAccount,
  getNetwork,
  switchNetwork,
  waitForTransaction,
  watchNetwork,
} from '@wagmi/core';
import { ethers } from 'ethers';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  filter,
  firstValueFrom,
  forkJoin,
  from,
  interval,
  map,
  Observable,
  startWith,
  switchMap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Item } from 'src/modules/core/models/items.model';
import { Material } from 'src/modules/core/models/material.model';
import { MiscellanyItem } from 'src/modules/core/models/misc.model';
import { StackPipe } from 'src/modules/core/pipes/stack.pipe';
import { getItemTypeSCBasedOnItem } from 'src/modules/utils';
import { ERC20ContractService } from 'src/services/contracts/erc20-contract.service';
import { NFTContractService } from 'src/services/contracts/nft-contract.service';
import { PresaleContractService } from 'src/services/contracts/presale-contract.service';
import { ExportImportService } from 'src/services/export-import.service';
import { ItemService } from 'src/services/item.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm.modal.component';
import { ItemTypeSC } from './enums/ItemTypesSC';

@Component({
  selector: 'app-export-import-nft',
  templateUrl: './export-import-nft.component.html',
  styleUrl: './export-import-nft.component.scss',
})
export class ExportImportNftComponent extends TemplatePage {
  //true export false import
  public exportTypeActive: boolean = true;
  public exportingObjectTypeActive: 'nft' | 'coins' = 'nft';

  public selectedUruksToExport = 0;
  private playerService = inject(PlayerService);
  viewportService = inject(ViewportService);
  itemService = inject(ItemService);
  importExport = inject(ExportImportService);
  spinnerService = inject(NgxSpinnerService);
  toastService = inject(ToastrService);
  store = inject(Store);
  router = inject(Router);
  walletService = inject(WalletService);
  stack = inject(StackPipe);
  modalService = inject(BsModalService);
  ERC20ContractService = inject(ERC20ContractService);
  NFTContractService = inject(NFTContractService);
  PRESALEContractService = inject(PresaleContractService);
  activatedRoute = inject(ActivatedRoute);
  public prefix = environment.permaLinkImgPref;
  public activeNetworkId = new BehaviorSubject<number>(0);
  public activeCorrectNetwork = this.activeNetworkId.pipe(
    filter((entry) => !!entry)
  );
  public toNumber = Number;
  public math = Math;
  @ViewChild('staticTabs', { static: false }) staticTabs?: TabsetComponent;

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
        this.ERC20ContractService.getBalanceOf(getAccount().address)
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
      return from(this.ERC20ContractService.getExportFee()).pipe(
        map((entry) => Number(ethers.formatEther(entry.toString())))
      );
    })
  );

  public getNFTExportFee$ = this.activeCorrectNetwork.pipe(
    switchMap(() => {
      return from(this.NFTContractService.getMintingFee()).pipe(
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
      return this.NFTContractService.getItemsWhitelisted(address);
    }),
    switchMap((entry) => {
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

  public whitelistedUruks$ = new BehaviorSubject(0);
  public whitelistedUruksInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.walletService.getValidAddress$;
    }),
    switchMap((address) => {
      return from(this.ERC20ContractService.getWhitelistedCoins(address)).pipe(
        catchError((err) => {
          console.error(err);
          return err;
        }),
        map((entry) => {
          return Number(ethers.formatEther(entry.toString()));
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
      let filtered = nfts.filter(
        (nft) => nft.itemType === itemType && !!nft.dbItem
      );
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

  constructor() {
    super();
    //pending URUKS
    this.whitelistedUruksInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => this.whitelistedUruks$.next(data));
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
    interval(5000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.store.dispatch(new RefreshPlayer()));

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

  async ngAfterViewInit() {
    const queryParams = await firstValueFrom(this.activatedRoute.queryParams);
    const { navigateToTab, importMode, exporObjectType } = queryParams;
    if (navigateToTab) {
      setTimeout(() => {
        if (this.staticTabs?.tabs[Number(navigateToTab)]) {
          this.staticTabs.tabs[Number(navigateToTab)].active = true;
        }
      }, 0);
    }
    if (importMode === 'true') {
      this.exportTypeActive = false;
    }
    if (!!exporObjectType) {
      this.exportingObjectTypeActive = exporObjectType;
    }
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

  public changeType(event: any) {
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
      const tx = await this.NFTContractService.exportItemsToNfts(
        [
          nftsUploaded.map((entry) => entry.id),
          nftsUploaded.map((entry) => entry.type),
          nftsUploaded.map((entry) => `ipfs://${entry.cid}`),
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
    const distribution = await this.getRawSelectedItems();
    const nftImports = distribution['NFT'];
    const presaleImports = distribution['PRESALE'];
    const finalIdsToImport = [...nftImports.ids, ...presaleImports.ids];
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
    const origins = {
      NFT: {
        ids: [],
        itemTypes: [],
      },
      PRESALE: {
        ids: [],
        itemTypes: [],
      },
    };
    this.allSelectedItems.forEach((selectedItem) => {
      if (
        selectedItem['itemType'] == ItemTypeSC.Potion ||
        selectedItem['itemType'] == ItemTypeSC.Miscellaneous
      ) {
        const foundNftsByType = allNFTItems.filter((nft) => {
          const sameType = nft.itemType == selectedItem['itemType'];
          const mapItemSubType = {
            [ItemTypeSC.Potion]:
              nft?.dbItem?.consumableDataId ==
              selectedItem['dbItem']?.consumableDataId,
            [ItemTypeSC.Miscellaneous]:
              nft?.dbItem?.miscellanyItemDataId ==
              selectedItem['dbItem']?.miscellanyItemDataId,
          };

          return sameType && mapItemSubType[selectedItem['itemType']];
        });

        foundNftsByType.forEach((entry) => {
          if (!origins[entry.sc_origin].ids.includes(entry.tokenId)) {
            origins[entry.sc_origin].ids.push(entry.tokenId);
            origins[entry.sc_origin].itemTypes.push(entry.itemType);
          }
        });
      } else {
        origins[selectedItem['sc_origin']].ids.push(selectedItem['tokenId']);
        origins[selectedItem['sc_origin']].itemTypes.push(
          selectedItem['itemType']
        );
      }
    });
    return origins;
  }

  public async triggerActionForNFT() {
    this.spinnerService.show();
    try {
      if (!!this.exportTypeActive) {
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
        this.spinnerService.hide();
      } else {
        const distribution = await this.getRawSelectedItems();
        const nftImports = distribution['NFT'];
        const presaleImports = distribution['PRESALE'];
        let hashNfts = null;
        let hashNftsPresale = null;
        if (nftImports.ids.length > 0) {
          hashNfts = await this.NFTContractService.importNftToItem([
            nftImports.ids,
            nftImports.itemTypes,
          ]);
        }

        if (presaleImports.ids.length > 0) {
          hashNftsPresale = await this.PRESALEContractService.importNftToGame([
            presaleImports.ids,
          ]);
        }
        await Promise.all([
          hashNfts
            ? firstValueFrom(this.importExport.importNft(hashNfts.hash))
            : Promise.resolve(),
          hashNftsPresale
            ? firstValueFrom(
                this.importExport.importNftPresale(hashNftsPresale.hash)
              )
            : Promise.resolve(),
        ]);

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

  public displayERC20ConfirmDialog() {
    return new Promise((resolve, reject) => {
      const config: ModalOptions = {
        initialState: {
          title: 'Do you wan to continue?',
          description: `Continuing the export, will reset your pending Golden Uruks and you won't be able to recover them. Do you want to proceed?`,
          accept: async () => {
            modalRef.hide();
            resolve(true);
          },
        },
      };
      const modalRef = this.modalService.show(ConfirmModalComponent, config);
      modalRef.onHide.subscribe(() => reject());
    });
  }

  public async triggerActionForERC20(hasPending = false) {
    if (hasPending) await this.displayERC20ConfirmDialog();
    this.spinnerService.show();
    try {
      if (!!this.exportTypeActive) {
        this.exportERC20();
      } else {
        this.importERC20();
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

  public async calculateFees(exportedUruks: number): Promise<string> {
    const exportFee = (await this.ERC20ContractService.getExportFee()) as any; // Obtenlo como string en wei
    const feeInWei = BigInt(exportFee as string); // Convertir directamente a BigInt para cálculos
    const feeMultiplier =
      exportedUruks % 1000 === 0
        ? Math.floor(exportedUruks / 1000)
        : Math.floor(exportedUruks / 1000) + 1;
    const totalFee = feeInWei * BigInt(feeMultiplier);
    return totalFee.toString();
  }

  public async exportPendingERC20(whitelistedUruks: number) {
    await this.exportERC20(false, whitelistedUruks);
  }

  private async exportERC20(
    whitelist = true,
    uruksToExport = this.selectedUruksToExport
  ) {
    try {
      if (whitelist) {
        await firstValueFrom(
          this.importExport.whiteListItemERC20(uruksToExport)
        );
      }
      const exportedUruks = Number(uruksToExport.toString()) ?? 0;
      const fees = BigInt(await this.calculateFees(exportedUruks));
      const uruksInWei = ethers.parseEther(exportedUruks.toString());
      await this.ERC20ContractService.triggerTx(() => {
        return this.ERC20ContractService.exportCoins([uruksInWei], fees);
      }, 'The coins got exported, you will receive them in your wallet soon!');
      this.selectedUruksToExport = 0;
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? error?.cause?.reason ?? error ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
    }
  }

  private async importERC20() {
    this.spinnerService.show();
    try {
      const res = await this.ERC20ContractService.importCoins([
        ethers.parseEther(this.selectedUruksToExport.toString()),
      ]);
      await firstValueFrom(this.importExport.importTokens(res.hash));
      this.toastService.success(
        'The coins are getting imported, you will receive them in your inventory soon!'
      );
      this.spinnerService.hide();
      this.selectedUruksToExport = 0;
    } catch (error: any) {
      this.toastService.error(
        error?.error?.message ?? error?.cause?.reason ?? error ?? undefined,
        'Something went wrong'
      );
      this.spinnerService.hide();
      this.selectedUruksToExport = 0;
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
      await this.NFTContractService.deletePendingExport([idItems, itemsTypes]);
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
