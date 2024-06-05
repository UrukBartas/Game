import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ConsumableData } from 'src/modules/core/models/consumable.model';
import { ItemData } from 'src/modules/core/models/items.model';
import { MaterialData } from 'src/modules/core/models/material.model';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-generic-item-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-item-tooltip.component.html',
  styleUrl: './generic-item-tooltip.component.scss',
})
export class GenericItemTooltipComponent {
  @Input() item: ConsumableData | MaterialData | (ItemData & { price?: any });
  @Input() showPrice = false;

  viewportService = inject(ViewportService);
  public anyfy = (anything) => anything as any;
  public getRarityColor = getRarityColor;
}
