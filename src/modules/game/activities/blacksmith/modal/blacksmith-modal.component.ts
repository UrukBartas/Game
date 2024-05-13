import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { firstValueFrom, take } from 'rxjs';
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
  upgrade: boolean; //or recycle
  items: Array<Item>;
  modalRef = inject(BsModalRef);
  playerService = inject(PlayerService);
  itemService = inject(ItemService);
  storeService = inject(Store);
  viewportService = inject(ViewportService);
  onJobDone: (result) => void;
  preview;
  public currentMaterials: Array<Material> = [];
  ngOnInit() {
    if (this.items) {
      this.getCurrentUserMaterials();
      const observable = this.upgrade
        ? this.itemService.getUpgradeItemPreview(this.items[0].id)
        : this.itemService.getRecycleItemsPreview(
            this.items.map((entry) => entry.id)
          );

      observable.pipe(take(1)).subscribe((preview) => (this.preview = preview));
    }
  }

  accept() {
    if (this.items) {
      const observable = this.upgrade
        ? this.itemService.upgradeItem(this.items[0].id)
        : this.itemService.recycleItems(this.items.map((entry) => entry.id));

      observable.pipe(take(1)).subscribe((result) => {
        this.onJobDone(result);
        this.modalRef.hide();
      });
    }
  }

  doAction() {
    if (this.items) {
      const observable = this.upgrade
        ? this.itemService.upgradeItem(this.items[0].id)
        : this.itemService.recycleItems(this.items.map((entry) => entry.id));

      observable.pipe(take(1)).subscribe((result) => {
        this.onJobDone(result);
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
  }

  public userHasThisMaterial(material: {
    quantity: number;
    material: MaterialData;
  }) {
    const userHasTheMaterialRes = this.currentMaterials.find(
      (userMaterial) => userMaterial.materialDataId == material.material.id
    );
    if (!userHasTheMaterialRes) return false;
    return userHasTheMaterialRes.quantity >= material.quantity;
  }
}
