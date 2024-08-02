import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { firstValueFrom, of, take } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
import { Material, MaterialData } from 'src/modules/core/models/material.model';
import { ItemService } from 'src/services/item.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-blacksmith-modal',
  templateUrl: './blacksmith-modal.component.html',
  styleUrl: './blacksmith-modal.component.scss',
})
export class BlacksmithModalComponent implements OnInit {
  action: 'melt' | 'upgrade' | 'enchant';
  items: Array<Item>;
  modalRef = inject(BsModalRef);
  playerService = inject(PlayerService);
  itemService = inject(ItemService);
  storeService = inject(Store);
  viewportService = inject(ViewportService);
  onJobDone: (result) => void;
  preview;
  public currentMaterials: Array<Material> = [];
  public useMagicDust = new FormControl(false);
  public activeRecipe = signal(null);
  public priceAndMaterialsActiveRecipe$ = computed(() => {
    if (!this.activeRecipe()) return of([]);
    return this.itemService.getPreviewForRecipe(
      this.items[0].id,
      this.activeRecipe().id
    );
  });
  ngOnInit() {
    if (this.items) {
      this.getCurrentUserMaterials();
      let observable = of(null);
      if (this.action == 'upgrade') {
        observable = this.itemService.getUpgradeItemPreview(this.items[0].id);
      } else if (this.action == 'melt') {
        observable = this.itemService.getRecycleItemsPreview(
          this.items.map((entry) => entry.id)
        );
      } else if (this.action == 'enchant') {
        observable = this.itemService.getRecipes(this.items[0].id);
      }
      observable.pipe(take(1)).subscribe((preview) => {
        this.preview = preview;
      });
    }
  }

  accept() {
    if (this.items) {
      let observable = of(null);
      if (this.action == 'upgrade') {
        observable = this.itemService.upgradeItem(
          this.items[0].id,
          this.useMagicDust.value
        );
      } else if (this.action == 'melt') {
        observable = this.itemService.recycleItems(
          this.items.map((entry) => entry.id)
        );
      } else if (this.action == 'enchant') {
        observable = this.itemService.enchantItem(
          this.items[0].id,
          this.activeRecipe().id
        );
      }
      observable.pipe(take(1)).subscribe((result) => {
        this.onJobDone(result);
        this.modalRef.hide();
      });
    }
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

    this.userHasMagicDust()
      ? this.useMagicDust.enable()
      : this.useMagicDust.disable();
  }

  private userHasMagicDust() {
    return !!this.currentMaterials.find(
      (userMaterial) => userMaterial.materialDataId == 'MagicDust'
    );
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
