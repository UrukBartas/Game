import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Item } from 'src/modules/core/models/items.model';
import { animateElement } from 'src/modules/utils';
import { InventoryService } from 'src/services/inventory.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { BlacksmithModalComponent } from './modal/blacksmith-modal.component';
import * as party from 'party-js';
import { Store } from '@ngxs/store';
import { RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-blacksmith',
  templateUrl: './blacksmith.component.html',
  styleUrl: './blacksmith.component.scss',
})
export class BlacksmithComponent extends TemplatePage implements AfterViewInit {
  @ViewChild('anvil', { read: ElementRef }) anvil: ElementRef;

  private playerService = inject(PlayerService);
  private inventoryService = inject(InventoryService);
  private viewportService = inject(ViewportService);
  private modalService = inject(BsModalService);
  private store = inject(Store);

  dialog: string;
  showDialog = false;
  selectedItem: Item;
  hovered = false;

  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public currentInventory$ = this.playerService.getItems();

  openModal(upgrade: boolean) {
    const config: ModalOptions = {
      initialState: {
        upgrade,
        item: this.selectedItem,
        onJobDone: (result) => {
          this.selectedItem = upgrade ? result : null;
          this.currentInventory$ = this.playerService.getItems();
          this.triggerDialog("Ain't nothin' but a peanut", 1500);
          this.store.dispatch(new RefreshPlayer());
          setTimeout(() => {
            const effect = upgrade ? party.confetti : party.sparkles;
            effect(this.anvil.nativeElement, {
              count: party.variation.range(40, 100),
            });
          }, 100);
        },
      },
    };
    this.modalService.show(BlacksmithModalComponent, config);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const random = Math.floor(Math.random() * 3);
      if (random === 0) {
        this.triggerDialog("Welcome to Coleman's workshop 🛠️", 1500);
      } else if (random === 1) {
        this.triggerDialog('LIGHTWEIGHT BABY!!', 1500);
      } else if (random === 2) {
        this.triggerDialog('Create or destroy. You decide.', 1500);
      }
    }, 250);
  }

  triggerDialog(text: string, duration: number) {
    this.dialog = text;
    this.showDialog = true;
    setTimeout(() => {
      animateElement('.blacksmith-dialog', 'fadeIn');
    });

    setTimeout(() => {
      animateElement(
        '.blacksmith-dialog',
        'fadeOut',
        () => (this.showDialog = false)
      );
    }, duration);
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

  getInventoryBoxSize(): number {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 60;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 40;
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
