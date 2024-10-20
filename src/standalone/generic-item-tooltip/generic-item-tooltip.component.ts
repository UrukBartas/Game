import { CommonModule } from '@angular/common';
import { Component, inject, Input, TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConsumableData } from 'src/modules/core/models/consumable.model';
import { ItemData } from 'src/modules/core/models/items.model';
import { MaterialData } from 'src/modules/core/models/material.model';
import { MiscellanyItemData } from 'src/modules/core/models/misc.model';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
export type GenericItem =
  | ConsumableData
  | MaterialData
  | (MiscellanyItemData & { price?: any })
  | (ItemData & { price?: any });
@Component({
  selector: 'app-generic-item-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-item-tooltip.component.html',
  styleUrl: './generic-item-tooltip.component.scss',
})
export class GenericItemTooltipComponent {
  @Input() item: GenericItem;
  @Input() souldBound = false;
  @Input() showPrice = false;
  @Input() customTemplate: TemplateRef<any>;
  public prefix = environment.permaLinkImgPref;
  viewportService = inject(ViewportService);
  public anyfy = (anything) => anything as any;
  public getRarityColor = getRarityColor;
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.warn(this.item.imageLocal)
  }
}
