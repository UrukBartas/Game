import { Component, inject, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { FightService } from 'src/services/fight.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-consumable-modal',
  templateUrl: './consumable-modal.component.html',
  styleUrl: './consumable-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ConsumableModalComponent {
  title: string;
  description: string;
  accept;
  modalRef = inject(BsModalRef);
  fightService = inject(FightService);
  viewportService = inject(ViewportService);
  consumables = [];
  buttonDisabled = true;

  constructor() {
    this.fightService
      .consumables()
      .pipe(take(1))
      .subscribe((consumables) => {
        this.consumables = consumables.map((consumable) => {
          delete consumable.consumableData.price;
          return consumable;
        });
      });
  }

  selectItem(item) {
    this.buttonDisabled = false;
    this.consumables = this.consumables.map((consumable) => {
      consumable.selected = consumable.id === item.id;
      return consumable;
    });
  }

  useConsumable() {
    const selectedItem = this.consumables.find(
      (consumable) => consumable.selected
    );
    if (selectedItem) {
      this.accept(selectedItem.id);
    }
  }

  public getItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 62.5;
    }
    return 125;
  }
}
