import { CommonModule } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, of } from 'rxjs';
import { MaterialDataService } from 'src/services/material-data.service';
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
  @Input() itemType: 'MATERIAL' = 'MATERIAL';
  @Input() itemId: string;
  @Input() amount: number = 0;
  materialDataService = inject(MaterialDataService);
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
      // Agrega más casos según necesites
      // case 'OTRO_TIPO':
      //   return this.otroServicio.byId(this.itemId);
      default:
        return of(EMPTY);
    }
  }
}
