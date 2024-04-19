import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/items.model';

@Pipe({
  name: 'compareItem',
  standalone: true,
})
export class CompareItemPipe implements PipeTransform {
  transform(baseItem: Item, compareWithItem: Item, stat: string): string {
    const baseStat = baseItem[stat] || 0;
    const compareStat = compareWithItem[stat] || 0;

    let difference = baseStat - compareStat;

    if (difference === 0) {
      return '0';
    } else if (difference > 0) {
      return `+${+parseFloat(difference + '').toFixed(2)}`;
    } else {
      return `${+parseFloat(difference + '').toFixed(2)}`;
    }
  }
}
