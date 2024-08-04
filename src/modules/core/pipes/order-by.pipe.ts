import { Pipe, PipeTransform } from '@angular/core';
import { get } from 'lodash-es';

@Pipe({
  name: 'orderBy',
  standalone: true,
})
export class OrderByPipe implements PipeTransform {
  transform(
    array: any[],
    property: string,
    order: 'asc' | 'desc' = 'asc'
  ): any[] {
    if (!Array.isArray(array) || !property) {
      return array;
    }

    const sortedArray = array.sort((a, b) => {
      const aValue = get(a, property);
      const bValue = get(b, property);

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });

    return sortedArray;
  }
}
