import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
import { ItemService } from 'src/services/item.service';
import { ViewportService } from 'src/services/viewport.service';
import { RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-blacksmith-modal',
  templateUrl: './blacksmith-modal.component.html',
  styleUrl: './blacksmith-modal.component.scss',
})
export class BlacksmithModalComponent implements OnInit {
  upgrade: boolean; //or recycle
  item: Item;
  modalRef = inject(BsModalRef);
  itemService = inject(ItemService);
  storeService = inject(Store);
  viewportService = inject(ViewportService);
  onJobDone: (result) => void;
  preview;

  ngOnInit() {
    if (this.item) {
      const observable = this.upgrade
        ? this.itemService.getUpgradeItemPreview(this.item.id)
        : this.itemService.getRecycleItemPreview(this.item.id);

      observable.pipe(take(1)).subscribe((preview) => (this.preview = preview));
    }
  }

  accept() {
    if (this.item) {
      const observable = this.upgrade
        ? this.itemService.upgradeItem(this.item.id)
        : this.itemService.recycleItem(this.item.id);

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
}
