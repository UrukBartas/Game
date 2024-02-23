import {
  AfterViewInit,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { map, take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { animateElement } from 'src/modules/utils';
import { ShopService } from 'src/services/shop.service';
import { ViewportService } from 'src/services/viewport.service';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm.modal.component';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ShopComponent extends TemplatePage implements AfterViewInit {
  viewportService = inject(ViewportService);
  shopService = inject(ShopService);
  dialog: string;
  showDialog = false;
  items: any[];

  constructor(private modalService: BsModalService) {
    super();
    this.shopService
      .get('/')
      .pipe(
        take(1),
        map((items) => {
          return items.map((item) => {
            item.data.price = item.price;
            return item.data;
          });
        })
      )
      .subscribe((items) => (this.items = items));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (Math.floor(Math.random() * 2) === 0) {
        this.triggerDialog("Hey friend, it's nice to see you again! 💖");
      } else {
        this.triggerDialog('If you like something, let me know!');
      }
    }, 250);
  }

  triggerDialog(text: string) {
    this.dialog = text;
    this.showDialog = true;
    setTimeout(() => {
      animateElement('.shop-tender-dialog', 'fadeIn');
    });

    setTimeout(() => {
      animateElement(
        '.shop-tender-dialog',
        'fadeOut',
        () => (this.showDialog = false)
      );
    }, 2000);
  }

  selectItem(item) {
    if (item.selected) {
      item.selected = false;
      return;
    }

    item.selected = true;
    if (Math.floor(Math.random() * 5) === 0) {
      this.triggerDialog(
        `Oh, so you are interested in ${item.name ? item.name : item.itemData.name}?`
      );
    }
  }

  getSelectedItems() {
    return this.items.filter((item) => item.selected);
  }

  getSelectedItemsPrice() {
    return this.getSelectedItems().reduce(
      (total, currentItem) =>
        Number.parseFloat(total) + Number.parseFloat(currentItem.price),
      0
    );
  }

  buyItems() {
    const config: ModalOptions = {
      initialState: {
        title: 'Purchase',
        description: `Are you sure you want to purchase this items? \nTotal is: ${this.getSelectedItemsPrice()} golden uruks.`,
        accept: () => {
          this.triggerDialog('Thank you! You surely did a good trade 😏');
          this.items = this.items.filter((items) => !items.selected) ?? [];
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }

  getItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 65;
    }
    return 140;
  }
}
