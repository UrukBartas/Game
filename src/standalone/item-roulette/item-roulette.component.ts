import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { environment } from 'src/environments/environment';
import { Item } from 'src/modules/core/models/items.model';
import { getGenericItemItemData } from 'src/modules/utils';
import { SoundService } from 'src/services/sound.service';
import { GenericItemTooltipComponent } from '../generic-item-tooltip/generic-item-tooltip.component';
import { ItemBoxComponent } from '../item-box/item-box.component';
import { ItemTooltipComponent } from '../item-tooltip/item-tooltip.component';

@Component({
  selector: 'app-item-roulette',
  standalone: true,
  imports: [
    CommonModule,
    ItemBoxComponent,
    ItemTooltipComponent,
    GenericItemTooltipComponent,
  ],
  templateUrl: './item-roulette.component.html',
  styleUrls: ['./item-roulette.component.scss'],
})
export class ItemRouletteComponent {
  @Input() items: any[] = [];
  displayedItems: any[] = [];
  @Input() resultItem: Item;
  @Input() duplicateItemsSize = 5;
  translateX: number = 0;
  interval: any;
  store = inject(Store);
  sound = inject(SoundService);
 public prefix = environment.permaLinkImgPref;
  @Output() spinEnded = new EventEmitter<void>();
  public spinRunning = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['items'].currentValue) {
      this.displayedItems = this.repeatItems(
        this.items,
        this.duplicateItemsSize
      ); // Repetir ítems para simular infinitos
    }
  }

  repeatItems(items: any[], times: number): any[] {
    let repeatedItems: any[] = [];
    for (let i = 0; i < times; i++) {
      repeatedItems = repeatedItems.concat(items);
    }
    return repeatedItems;
  }

  startRoulette(): void {
    if (!this.resultItem) {
      console.error('resultItem is not defined');
      return;
    }
    this.sound.playSound('assets/sounds/roulette.mp3');
    this.spinRunning = true;
    const itemWidth = 100; // Ancho del ítem
    const gap = 20; // Gap entre ítems
    const totalWidth = itemWidth + gap;
    const duration = 10000; // 10 segundos
    const startTime = Date.now();

    // Buscar el ítem duplicado más cercano al centro de la pantalla
    const centerIndex = Math.floor(this.displayedItems.length / 2);
    let closestIndex = centerIndex;
    let minDistance = Number.MAX_VALUE;

    for (let i = centerIndex; i < this.displayedItems.length; i++) {
      const compareId =
        getGenericItemItemData(this.displayedItems[i])?.id ??
        this.displayedItems[i]?.id;
      const resultItemCompareId = getGenericItemItemData(this.resultItem)?.id;

      if (compareId === resultItemCompareId) {
        const distance = Math.abs(i - centerIndex);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
    }

    // Calcular la posición final para centrar el ítem resultante
    const finalOffset =
      closestIndex * totalWidth -
      (document.documentElement.clientWidth / 2 - itemWidth / 2);
    const initialTranslateX = this.translateX;
    const totalDistance = finalOffset - initialTranslateX;

    const step = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / duration;

      if (progress < 1) {
        const easingProgress = 1 - Math.pow(1 - progress, 2); // Desaceleración cuadrática
        this.translateX = initialTranslateX - totalDistance * easingProgress;
        requestAnimationFrame(step);
      } else {
        this.translateX = -finalOffset; // Asegurarse de que termina en la posición exacta
        this.spinEnded.emit();
        this.spinRunning = false;
      }
    };

    requestAnimationFrame(step);
  }
}
