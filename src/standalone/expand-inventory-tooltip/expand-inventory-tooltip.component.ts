import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { map } from 'rxjs';
import { Rarity } from 'src/modules/core/models/items.model';
import { ToIpfsImageFromCidPipe } from 'src/modules/core/pipes/to-ipfs-image-from-cid.pipe';
import { getRarityColor, getRarityText } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-expand-inventory-tooltip',
  standalone: true,
  imports: [CommonModule, ToIpfsImageFromCidPipe],
  templateUrl: './expand-inventory-tooltip.component.html',
  styleUrl: './expand-inventory-tooltip.component.scss',
})
export class ExpandInventoryTooltipComponent {
  public getRarityColor = getRarityColor;
  public getRarityText = getRarityText;
  public viewportService = inject(ViewportService);

  @Input() currentLevelInventory = 4;
  @Input() cost = 100;

  ngOnInit(): void {}

  public RarityEnum = Rarity;

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
