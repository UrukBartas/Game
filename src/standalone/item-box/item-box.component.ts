import { CommonModule } from '@angular/common';
import {
    Component,
    HostBinding,
    inject,
    Input,
    TemplateRef,
} from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { memoize } from 'lodash-decorators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Rarity } from 'src/modules/core/models/items.model';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-item-box',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './item-box.component.html',
  styleUrl: './item-box.component.scss',
})
export class ItemBoxComponent {
  @HostBinding('class') class = 'h-fit';
  vieportService = inject(ViewportService);
  modalService = inject(BsModalService);
  @Input() height = 30;
  @Input() width = 30;
  @Input() item: any;
  @Input() image: string = null;
  @Input() text: string = null;
  @Input() active = false;
  @Input() displayTooltip = true;
  @Input() stack: any = 0;
  @Input() calculatedStack: Function;
  @Input() rarity: Rarity;
  @Input() upgradeLevel: number;
  @Input() disabled = false;
  @Input() overlayImage: string = null;
  modalRef?: BsModalRef;
  public isNaNLocal = isNaN;
  getRarityColor = getRarityColor;
  rarityEnum = Rarity;
  public prefix = ViewportService.getPreffixImg();

  @memoize()
  public addPrefix(image: string) {
    const startsWithAbsolute = image.charAt(0) == '/';
    return startsWithAbsolute ? this.prefix + image : this.prefix + '/' + image;
  }

  public isSmallDevice() {
    return (
      this.vieportService.screenSize == 'xs' ||
      this.vieportService.screenSize == 'sm'
    );
  }

  public showModalTooltipOnSmallDevices(template: TemplateRef<void>) {
    if (this.isSmallDevice()) {
      this.modalRef = this.modalService.show(template, {
        backdrop: true,
        ignoreBackdropClick: false,
      });
    }
  }
}
