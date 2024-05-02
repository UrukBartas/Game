import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  ViewEncapsulation,
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
import { DndDropEvent } from 'ngx-drag-drop';

@Component({
  selector: 'app-blacksmith',
  templateUrl: './blacksmith.component.html',
  styleUrl: './blacksmith.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BlacksmithComponent extends TemplatePage implements AfterViewInit {
  @ViewChild('anvil', { read: ElementRef }) anvil: ElementRef;
  @ViewChild('result', { read: ElementRef }) result: ElementRef;

  private playerService = inject(PlayerService);
  private inventoryService = inject(InventoryService);
  private viewportService = inject(ViewportService);
  private modalService = inject(BsModalService);
  private store = inject(Store);

  dialog: string;
  showDialog = false;
  selectedItem: Item;
  resultItem;
  hovered = false;

  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public currentInventory$ = this.playerService.getItems();

  ngAfterViewInit() {
    setTimeout(() => {
      const random = Math.floor(Math.random() * 2);
      if (random === 0) {
        this.triggerDialog("Welcome to Coleman's workshop 🛠️", 1500);
      } else if (random === 1) {
        this.triggerDialog('Create or destroy. You decide.', 1500);
      }
    }, 250);
  }

  openModal(upgrade: boolean) {
    const config: ModalOptions = {
      initialState: {
        upgrade,
        item: this.selectedItem,
        onJobDone: (result) => {
          if (upgrade) {
            this.onUpgradeDone(result);
          } else {
            this.onRecycleDone();
          }
        },
      },
    };
    this.modalService.show(BlacksmithModalComponent, config);
  }

  private onRecycleDone() {
    this.selectedItem = null;
    this.currentInventory$ = this.playerService.getItems();
    this.triggerDialog("Ain't nothin' but a peanut", 1500);
    this.store.dispatch(new RefreshPlayer());
    setTimeout(() => {
      party.sparkles(this.anvil.nativeElement, {
        count: party.variation.range(40, 100),
      });
    }, 100);
  }

  private onUpgradeDone(result: Item) {
    this.resultItem = result;
    if (result) {
      this.selectedItem = result;
      setTimeout(() => {
        party.confetti(this.result.nativeElement, {
          count: party.variation.range(100, 200),
        });
      }, 100);
    }

    this.store.dispatch(new RefreshPlayer());
    this.currentInventory$ = this.playerService.getItems();
  }

  public closeResult() {
    if (!this.resultItem) {
      this.selectedItem = null;
    }
    this.triggerDialog(
      !this.resultItem ? 'OH BABY THAT HURTS!!' : 'LIGHTWEIGHT BABY!!',
      1500
    );
    this.resultItem = null;
  }

  onAnvilDrop(event: DndDropEvent) {
    this.selectedItem = event.data;
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
