import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ConsumableData } from 'src/modules/core/models/consumable.model';
import { MaterialData } from 'src/modules/core/models/material.model';
import { ToIpfsImageFromCidPipe } from 'src/modules/core/pipes/to-ipfs-image-from-cid.pipe';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-consumable-tooltip',
  standalone: true,
  imports: [CommonModule, ToIpfsImageFromCidPipe],
  templateUrl: './consumable-tooltip.component.html',
  styleUrl: './consumable-tooltip.component.scss',
})
export class ConsumableTooltipComponent {
  @Input() item: ConsumableData;
  @Input() showPrice = false;

  viewportService = inject(ViewportService);
  public anyfy = (anything) => anything as any;
  public getRarityColor = getRarityColor;
  public getItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 150;
    }
    return 200;
  }
}
