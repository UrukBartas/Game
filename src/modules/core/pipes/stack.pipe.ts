import { Pipe, PipeTransform } from '@angular/core';
import { get } from 'lodash';

@Pipe({
  name: 'stack',
  standalone: true,
})
export class StackPipe implements PipeTransform {
  transform(value: Array<any>, propertyNameToStackBy: string): Array<any> {
    if (!value) return [];
    const res = value.reduce((prev, next) => {
      const foundGroupedIndex = prev.findIndex(
        (entry) =>
          get(entry, propertyNameToStackBy) == get(next, propertyNameToStackBy)
      );
      if (foundGroupedIndex < 0) {
        next['stack'] = 1;
        prev.push(next);
      } else {
        prev[foundGroupedIndex]['stack'] = prev[foundGroupedIndex]['stack'] + 1;
      }

      return prev;
    }, []);
    return res;
  }
}
