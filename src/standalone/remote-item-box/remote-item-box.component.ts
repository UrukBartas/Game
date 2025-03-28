import { CommonModule } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, of } from 'rxjs';
import { ConsumableDataService } from 'src/services/consumable-data.service';
import { MaterialDataService } from 'src/services/material-data.service';
import { MiscellanyDataService } from 'src/services/miscellany-data.service';
import { ViewportService } from 'src/services/viewport.service';
import { GenericItemTooltipComponent } from '../generic-item-tooltip/generic-item-tooltip.component';
import { ItemBoxComponent } from '../item-box/item-box.component';

@Component({
  selector: 'app-remote-item-box',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, ItemBoxComponent, GenericItemTooltipComponent],
  templateUrl: './remote-item-box.component.html',
  styleUrl: './remote-item-box.component.scss'
})
export class RemoteItemBoxComponent {
  @Input() itemType: 'MATERIAL' | 'MISCELLANY' | 'CONSUMABLE' = 'MATERIAL';
  @Input() itemId: string;
  @Input() amount: number = 0;
  @Input() height: number = 30;
  @Input() width: number = 30;
  materialDataService = inject(MaterialDataService);
  miscellanyDataService = inject(MiscellanyDataService);
  consumableDataService = inject(ConsumableDataService);
  getItem$ = of(EMPTY) as Observable<any>;
  public prefix = ViewportService.getPreffixImg();

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['itemId'] && changes['itemId'].currentValue !== changes['itemId'].previousValue) ||
      (changes['itemType'] && changes['itemType'].currentValue !== changes['itemType'].previousValue)) {
      this.getItem$ = this.getItemByType();
    }
  }

  private getItemByType() {
    if (!this.itemId) return of(EMPTY);

    switch (this.itemType) {
      case 'MATERIAL':
        return this.materialDataService.byId(this.itemId);
      case 'MISCELLANY':
        return this.miscellanyDataService.byId(this.itemId);
      case 'CONSUMABLE':
        return this.consumableDataService.byId(this.itemId);
      default:
        return of(EMPTY);
    }
  }
}
