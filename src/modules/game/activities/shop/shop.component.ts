import { DecimalPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { filter, firstValueFrom, map, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { MiscellanyItemType } from 'src/modules/core/models/misc.model';
import { animateElement } from 'src/modules/utils';
import { ShopService } from 'src/services/shop.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
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
  modalService = inject(BsModalService);
  store = inject(Store);
  decimalPipe = inject(DecimalPipe);
  dialog: string;
  showDialog = false;
  items: any[];
  shopItems = [];
  rollAnimation: string;
  premiumRollsNumber = 0;
  public selectedTab = '0';
  public miscellanyItemType = MiscellanyItemType;
  public prefix = environment.permaLinkImgPref;
  player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));

  // TODO añadir itemTypes a todos los shopitems desde back
  public displayItemsDependingOnType(items: any) {
    if (!items) return [];
    if (this.selectedTab == '0') {
      return items.filter((entry) => !!entry.itemDataId);
    } else if (this.selectedTab == '1') {
      return items.filter(
        (entry) => !entry.consumableType && !entry.itemDataId && !entry.itemType
      );
    } else if (this.selectedTab == '2') {
      return items.filter((entry) => !!entry.consumableType);
    } else if (this.selectedTab == '3') {
      return items.filter(
        (entry) =>
          entry?.itemType == MiscellanyItemType.Recipe ||
          entry?.itemType == MiscellanyItemType.Boost
      );
    }
  }

  public getItem$ = (itemType: ItemType) => {
    return this.player$.pipe(
      filter((player) => !!player),
      map((player) => player.items),
      map((items: Array<Item>) => {
        const foundItem = items.find(
          (item) => item.itemData.itemType == itemType && item.equipped
        );
        return foundItem;
      })
    );
  };
  constructor() {
    super();
    this.loadItems();
  }

  public obtainStacks = (item: any) => {
    if (item.itemType == MiscellanyItemType.Boost) {
      const parts = item.id.split('_');
      return '+' + Number(parts[parts.length - 1]) + '%';
    }
    return '';
  };

  ngAfterViewInit() {
    setTimeout(() => {
      if (Math.floor(Math.random() * 2) === 0) {
        this.triggerDialog("Hey friend, it's nice to see you again! 💖", 1500);
      } else {
        this.triggerDialog('If you like something, let me know!', 1500);
      }
    }, 250);
  }

  loadItems() {
    this.shopService
      .get('/')
      .pipe(
        take(1),
        map((items) => {
          this.shopItems = items;
          return items.map((item) => {
            item.data.price = item.price;
            item.data.shopItemId = item.id;
            return item.data;
          });
        })
      )
      .subscribe((items) => (this.items = items));
  }

  triggerDialog(text: string, duration: number) {
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
    }, duration);
  }

  selectItem(item) {
    if (item.selected) {
      item.selected = false;
      return;
    }

    item.selected = true;
    if (Math.floor(Math.random() * 5) === 0) {
      this.triggerDialog(
        `Oh, so you are interested in ${item.name ? item.name : item.itemData.name}?`,
        1000
      );
    }
  }

  getSelectedItems() {
    return this.items?.filter((item) => item.selected) ?? [];
  }

  getSelectedItemsPrice() {
    const totalPrice = this.getSelectedItems().reduce(
      (total, currentItem) =>
        Number.parseFloat(total) + Number.parseFloat(currentItem.price),
      0
    );
    return this.decimalPipe.transform(totalPrice, '1.0-2');
  }

  buyItems() {
    const config: ModalOptions = {
      initialState: {
        title: 'Purchase',
        description: `Are you sure you want to purchase this items? \nTotal is: ${this.getSelectedItemsPrice()} golden uruks.`,
        accept: () => {
          this.shopService
            .buyItems(
              this.items
                .filter((items) => items.selected)
                .map((item) => item.shopItemId)
            )
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.triggerDialog(
                  'Thank you! You surely did a good trade 😏',
                  1500
                );
                this.items =
                  this.items.filter((items) => !items.selected) ?? [];
                this.store.dispatch(new RefreshPlayer());
              },
              error: (error) => {
                this.triggerDialog(error.error, 1500);
              },
            });

          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }

  dailyRoll() {
    this.rollAnimation = 'hide-items';
    this.shopService
      .dailyRoll()
      .pipe(take(1))
      .subscribe(() => {
        this.triggerDialog("Let's see what you've got!", 1000);
        setTimeout(() => {
          this.loadItems();
        }, 1000);
        setTimeout(() => {
          this.rollAnimation = 'show-items';
          setTimeout(() => {
            this.showRareRollDialog();
          }, 500);
        }, 2000);
      });
  }

  premiumRoll() {
    this.shopService
      .getPremiumRollData()
      .pipe(take(1))
      .subscribe((rollData) => {
        const config: ModalOptions = {
          initialState: {
            title: 'Premium Roll',
            description: `With each roll your chances for rarer items improve! <br>
            Number of rolls: <strong class='text-third'>${rollData.rollNumber} </strong> <br>
            Current roll price is at: <strong class='text-third'>${rollData.price}</strong> <br>
            Do you want to roll?`,
            accept: async () => {
              const actualUruks = await firstValueFrom(
                this.player$.pipe(map((player) => player.uruks))
              );
              if (actualUruks < rollData.price) {
                this.triggerDialog(
                  'Come back with more Golden Uruks, ya bastard! 💀',
                  3000
                );
              } else {
                this.rollAnimation = 'hide-items';
                this.shopService
                  .premiumRoll()
                  .pipe(take(1))
                  .subscribe(() => {
                    this.triggerDialog("Good luck, let's roll!", 1000);
                    this.store.dispatch(new RefreshPlayer());
                    setTimeout(() => {
                      this.loadItems();
                    }, 1000);
                    setTimeout(() => {
                      this.rollAnimation = 'show-items';
                      setTimeout(() => {
                        this.showRareRollDialog();
                      }, 500);
                    }, 1000);
                  });
              }
              modalRef.hide();
            },
          },
        };
        const modalRef = this.modalService.show(ConfirmModalComponent, config);
      });
  }

  private showRareRollDialog() {
    if (this.items.find((item) => item.itemData?.rarity === Rarity.LEGENDARY)) {
      this.triggerDialog('Wooow, is that a legendary? 🤯', 2000);
    } else if (
      this.items.find((item) => item.itemData?.rarity === Rarity.MYTHIC)
    ) {
      this.triggerDialog('OHMYGOD A MYTHICAL WOOOOOW!!! 💥😱🎆', 2000);
    }
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

  getButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 'btn-lg';
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 'btn-md';
    }
  }

  getShowItemCompare(): boolean {
    switch (this.viewportService.screenHeight) {
      case 'xxl':
      case 'xl':
      case 'lg':
      case 'md':
        return true;
      case 'xs':
      case 'sm':
      default:
        return false;
    }
  }
}
