import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/items.model';

@Pipe({
  name: 'compareItem',
  standalone: true,
})
export class CompareItemPipe implements PipeTransform {
  transform(baseItem: Item, compareWithItem: Item, stat: string): string {
    let baseStat = 0;
    if (!!baseItem && baseItem[stat]) {
      baseStat = baseItem[stat];
    }
    let compareStat = 0;
    if (!!compareWithItem && !!compareWithItem[stat]) {
      compareStat = compareWithItem[stat];
    }

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
