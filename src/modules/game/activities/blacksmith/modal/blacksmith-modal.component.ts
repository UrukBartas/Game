import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
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
  itemId: number;
  modalRef = inject(BsModalRef);
  itemService = inject(ItemService);
  storeService = inject(Store);
  viewportService = inject(ViewportService);
  onJobDone: () => {};
  preview;

  ngOnInit() {
    if (this.itemId) {
      const observable = this.upgrade
        ? this.itemService.getUpgradeItemPreview(this.itemId)
        : this.itemService.getRecycleItemPreview(this.itemId);

      observable.pipe(take(1)).subscribe((preview) => (this.preview = preview));
    }
  }

  accept() {
    if (this.itemId) {
      const observable = this.upgrade
        ? this.itemService.upgradeItem(this.itemId)
        : this.itemService.recycleItem(this.itemId);

      observable.pipe(take(1)).subscribe(() => {
        this.onJobDone();
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
