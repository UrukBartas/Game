import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Rarity } from 'src/modules/core/models/items.model';
import { getRarityColor } from 'src/modules/utils';
@Component({
  selector: 'app-item-box',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './item-box.component.html',
  styleUrl: './item-box.component.scss',
})
export class ItemBoxComponent {
  @HostBinding('class') class = 'h-fit';
  @Input() height = 30;
  @Input() width = 30;
  @Input() item: any;
  @Input() image: string = null;
  @Input() active = false;
  @Input() displayTooltip = true;
  @Input() stack: any = 0;
  @Input() calculatedStack: Function;
  @Input() rarity: Rarity;
  @Input() upgradeLevel: number;

  public isNaNLocal = isNaN;
  getRarityColor = getRarityColor;
  rarityEnum = Rarity;
}
