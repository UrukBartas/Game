import {
  Component,
  computed,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Memoize } from 'lodash-decorators';
import { camelCase } from 'lodash-es';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { catchError, firstValueFrom, of, take, tap, throwError } from 'rxjs';
import { Item, Rarity } from 'src/modules/core/models/items.model';
import { Material, MaterialData } from 'src/modules/core/models/material.model';
import { ItemPickerComponent } from 'src/modules/game/components/item-picker/item-picker.component';
import { durabilityIsEnough, getRarityColor } from 'src/modules/utils';
import { ItemService } from 'src/services/item.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-blacksmith-modal',
  templateUrl: './blacksmith-modal.component.html',
  styleUrl: './blacksmith-modal.component.scss',
})
export class BlacksmithModalComponent implements OnInit {
  action: 'melt' | 'upgrade' | 'enchant' | 'combine' | 'repairs';
  items: Array<Item>;
  modalRef = inject(BsModalRef);
  playerService = inject(PlayerService);
  itemService = inject(ItemService);
  storeService = inject(Store);
  viewportService = inject(ViewportService);
  onJobDone: (result) => void;
  preview;
  public currentMaterials: Array<Material> = [];
  public activeRecipe = signal(null);
  public getRarityColor = getRarityColor;
  public camelCase = camelCase;
  public objectKeys = Object.keys;

  public prefix = ViewportService.getPreffixImg();
  @ViewChild(ItemPickerComponent) itemPicker: ItemPickerComponent;
  @Output() tellQuote = new EventEmitter<string>();


  public getItemImageBasedOnRarity = (rarity: Rarity | any) => {
    switch (rarity) {
      case Rarity.COMMON:
        return 'assets/items/weapon/common/6.webp';
      case Rarity.UNCOMMON:
        return 'assets/items/weapon/uncommon/2.webp';
      case Rarity.EPIC:
        return 'assets/items/weapon/epic/1.webp';
      case Rarity.LEGENDARY:
        return 'assets/items/weapon/legendary/6.webp';
      case Rarity.MYTHIC:
        return 'assets/items/weapon/mythic/3.webp';
    }
    return 'assets/items/weapon/common/6.webp';
  };

  public priceAndMaterialsActiveRecipe$ = computed(() => {
    if (!this.activeRecipe()) return of([]);
    return this.itemService.getPreviewForRecipe(
      this.items[0].id,
      this.activeRecipe().id
    );
  });
  ngOnInit() {}
  ngAfterViewInit(): void {
    this.updatePreview();
  }

  public confirmSelection(selectedMaterials: Array<Material>) {
    setTimeout(() => {
      this.updatePreview();
    }, 0);
  }

  public updatePreview() {
    if (this.items) {
      this.getCurrentUserMaterials();
      let observable = of(null);
      if (this.action == 'upgrade') {
        observable = this.itemService.getUpgradeItemPreview(
          this.items[0].id,
          this.itemPicker.selectedMaterials.map((e) => e.materialDataId)
        );
      } else if (this.action == 'melt') {
        observable = this.itemService.getRecycleItemsPreview(
          this.items.map((entry) => entry.id)
        );
      } else if (this.action == 'enchant') {
        observable = this.itemService.getRecipes(this.items[0].id);
      } else if (this.action == 'combine') {
        observable = this.itemService.getCombineItemsPreview(
          this.items.map((entry) => entry.id)
        );
      } else if (this.action == 'repairs') {
        observable = this.itemService.getRepairItemsPreview(
          this.items.map((entry) => entry.id)
        );
      }
      firstValueFrom(observable.pipe(tap((e) => (this.preview = e))));
    }
  }
  @Memoize()
  public externalMaterialFilter(materials: Array<Material>) {
    //Only showing materials that the blacksmith is interested on
    return (materials ?? []).filter((entry) =>
      [
        'MagicDust',
        'GoddessAegis',
        'BlessingOfTheAncients',
        'ShardOfTheGoldenUruk',
        'BlacksmithCodex',
      ].includes(entry.materialDataId)
    );
  }

  getPossibleDropsSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 100;
      default:
        return 50;
    }
  }

  private tellDurabilityIsNotEnough() {
    const herreroRonnieQuotes = [
      'What am I supposed to do with this?!',
      "C'mon, this ain't even a challenge!",
      "This thing's barely hanging on!",
      'You call this a weapon? Try harder!',
      "I ain't touching that peanut!",
      'Fix it yourself, lightweight!',
      "This ain't worth my hammer's time!",
      'You better bring me something with some life left in it!',
      'Durability like this? Not in my forge, buddy!',
      'You need to train your items harder!',
      "Ain't no magic gonna save this!",
      "C'mon, give me something worth my sweat!",
      'My hammer deserves better than this junk!',
      'You call this equipment? Get serious!',
      "This thing's dead—just like your motivation!",
      'Bring me something that still fights back!',
      "Fixing this ain't nothing but a waste of time!",
      "Durability? This thing doesn't even know the word!",
      "Lightweight! I can't even call this gear!",
      "Ain't nothin' to fix if it's already gone!",
    ];
    const randomIndex = Math.floor(Math.random() * herreroRonnieQuotes.length);
    this.tellQuote.emit(herreroRonnieQuotes[randomIndex]);
  }

  accept() {
    if (this.items) {
      const actionHandlers = {
        repairs: () =>
          this.itemService.getRepairItems(this.items.map((e) => e.id)),
        upgrade: () =>
          this.itemService
            .upgradeItem(
              this.items[0].id,
              this.itemPicker.selectedMaterials.map((e) => e.materialDataId)
            )
            .pipe(this.handleDurabilityError(this.items[0])),
        melt: () =>
          this.itemService.recycleItems(this.items.map((entry) => entry.id)),
        enchant: () =>
          this.itemService
            .enchantItem(this.items[0].id, this.activeRecipe().id)
            .pipe(this.handleDurabilityError(this.items[0])),
        combine: () =>
          this.itemService
            .getCombineItems(this.items.map((entry) => entry.id))
            .pipe(this.handleCombineDurabilityError(this.items)),
      };

      const observable = actionHandlers[this.action]?.() ?? of(null);

      observable.pipe(take(1)).subscribe((result) => {
        this.onJobDone(result);
        this.modalRef.hide();
      });
    }
  }

  private handleDurabilityError(item: any) {
    return catchError((e) => {
      if (!durabilityIsEnough(item)) {
        this.modalRef.hide();
        this.tellDurabilityIsNotEnough();
      }
      return throwError(e);
    });
  }

  private handleCombineDurabilityError(items: any[]) {
    return catchError((e) => {
      if (!items.every((item) => durabilityIsEnough(item))) {
        this.tellDurabilityIsNotEnough();
      }
      return throwError(e);
    });
  }

  getItemBoxSize(): number {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 100;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 60;
    }
  }

  private async getCurrentUserMaterials() {
    this.currentMaterials = (
      await firstValueFrom(this.playerService.getItemsMaterial())
    ).filter((entry) => !!entry);
  }

  public userHasThisMaterial(param: {
    quantity: number;
    material: MaterialData;
  }) {
    const userHasTheMaterialRes = this.currentMaterials.find(
      (userMaterial) => userMaterial.materialDataId == param.material.id
    );
    if (!userHasTheMaterialRes) return false;
    return userHasTheMaterialRes.quantity >= param.quantity;
  }
}
