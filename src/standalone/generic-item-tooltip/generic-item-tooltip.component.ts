import { CommonModule } from '@angular/common';
import { Component, inject, Input, TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConsumableData } from 'src/modules/core/models/consumable.model';
import { ItemData, Rarity } from 'src/modules/core/models/items.model';
import { MaterialData } from 'src/modules/core/models/material.model';
import { MiscellanyItemData } from 'src/modules/core/models/misc.model';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
export type GenericItem =
  | (ConsumableData & { rarity?: Rarity })
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
  @Input() extraData: any = null;
  rarityEnum = Rarity;
  public prefix = environment.permaLinkImgPref;
  public hasExtraData = () => Object.keys(this.extraData ?? {}).length > 0;
  viewportService = inject(ViewportService);
  public getRarityColor = getRarityColor;

  get rarity() {
    return this.item['rarity'];
  }

  public getExtraData() {
    return this.extraData || this.item.extraData;
  }
}
