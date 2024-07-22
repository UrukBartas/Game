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
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { DndDropEvent } from 'ngx-drag-drop';
import { FormControl } from '@angular/forms';
import { filter, firstValueFrom, map, Subject } from 'rxjs';
import { Material } from 'src/modules/core/models/material.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private viewportService = inject(ViewportService);
  private modalService = inject(BsModalService);
  private store = inject(Store);

  dialog: string;
  showDialog = false;
  resultItem;
  hovered = false;

  public calculatedStackRule = (item: Item) => {
    return !!item && !!item.canBeUpgraded ? '✨' : '';
  };

  public filterByUpgradableItems = (items: Item[]) => {
    if (!!this.upgradableItems.value)
      return items.filter((item) => !!item && !!item.canBeUpgraded);
    return items;
  };

  public inventoryUpdated$ = new Subject();
  public materialUpdated$ = new Subject();
  public currentInventory: Array<Item> = [];
  public currentMaterials: Array<Material> = [];
  public multipleSelection = new FormControl(false);
  public upgradableItems = new FormControl(false);
  public selectedMultipleItems: Array<Item> = [];

  public currentSize$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry.player.sockets)
  );

  constructor() {
    super();
    this.inventoryUpdated$.pipe(takeUntilDestroyed()).subscribe(async () => {
      this.currentInventory = await firstValueFrom(
        this.playerService.getItemsBlacksmith()
      );
    });
    this.materialUpdated$.pipe(takeUntilDestroyed()).subscribe(async () => {
      this.currentMaterials = await firstValueFrom(
        this.playerService.getItemsMaterial()
      );
    });
    this.inventoryUpdated$.next(true);
    this.materialUpdated$.next(true);
  }

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
        items: this.selectedMultipleItems,
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
    this.selectedMultipleItems = [];
    this.inventoryUpdated$.next(true);
    this.materialUpdated$.next(true);
    const random = Math.floor(Math.random() * 5);
    if (random === 0) {
      this.triggerDialog('Light weight ... Yeah buddy! 🛠️', 2500);
    } else if (random === 1) {
      this.triggerDialog(`Ain't nuttin' to it, but ta do it!😎`, 2500);
    } else if (random === 2) {
      this.triggerDialog("Ain't nothin' but a peanut", 2500);
    } else if (random === 3) {
      this.triggerDialog(
        `Give it to me, and I will forge something nice!.🛠️😎`,
        2500
      );
    } else if (random === 4) {
      this.triggerDialog(`That orc aint nothing but a goblin! 😎`, 2500);
    }

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
      this.selectedMultipleItems = [];
      setTimeout(() => {
        party.confetti(this.result.nativeElement, {
          count: party.variation.range(100, 200),
        });
      }, 100);
    }

    this.store.dispatch(new RefreshPlayer());
    this.inventoryUpdated$.next(true);
    this.materialUpdated$.next(true);
  }

  public closeResult() {
    if (!this.resultItem) {
      this.selectedMultipleItems = [];
    }
    this.triggerDialog(
      !this.resultItem ? 'OH BABY THAT HURTS!!' : 'LIGHTWEIGHT BABY!!',
      1500
    );
    this.resultItem = null;
  }

  onAnvilDrop(event: DndDropEvent) {
    this.selectedMultipleItems = [event.data];
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
