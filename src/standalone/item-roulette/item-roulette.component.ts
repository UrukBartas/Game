import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, inject } from '@angular/core';
import { ItemBoxComponent } from '../item-box/item-box.component';
import { Item } from 'src/modules/core/models/items.model';
import { ItemTooltipComponent } from '../item-tooltip/item-tooltip.component';
import { Store } from '@ngxs/store';
import { GenericItemTooltipComponent } from '../generic-item-tooltip/generic-item-tooltip.component';

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
  styleUrl: './item-roulette.component.scss',
})
export class ItemRouletteComponent {
  @Input() items: Item[] = [];
  displayedItems: Item[] = [];
  @Input() resultItem: Item;
  translateX: number = 0;
  interval: any;
  store = inject(Store);
  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['items'].currentValue) {
      this.displayedItems = this.repeatItems(this.items, 20); // Repetir ítems para simular infinitos
    }
  }

  repeatItems(items: Item[], times: number): Item[] {
    let repeatedItems: Item[] = [];
    for (let i = 0; i < times; i++) {
      repeatedItems = repeatedItems.concat(items);
    }
    return repeatedItems;
  }

  startRoulette(): void {
    if (!this.resultItem) {
      console.error('resultItem no está definido');
      return;
    }

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
      if (this.displayedItems[i].itemData.id === this.resultItem.itemData.id) {
        const distance = Math.abs(i - centerIndex);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
    }

    // Calcular la posición final para centrar el ítem resultante
    const finalOffset = closestIndex * totalWidth - (600 / 2 - itemWidth / 2); // Ajuste para centrar en el contenedor de 600px
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
      }
    };

    requestAnimationFrame(step);
  }
}
