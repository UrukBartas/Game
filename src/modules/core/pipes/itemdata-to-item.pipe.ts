import { Pipe, PipeTransform } from '@angular/core';
import { Item, ItemData } from '../models/items.model';

@Pipe({
  name: 'itemdataToItem',
  standalone: true,
})
export class ItemdataToItemPipe implements PipeTransform {
  transform(value: ItemData): Item {
    return {
      itemData: value,
      equipped: false,
      enabled: true,
      level: 'unknown' as any,
    } as Item;
  }
}
