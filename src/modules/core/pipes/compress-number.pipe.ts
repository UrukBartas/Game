import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'compressNumber',
  standalone: true,
})
export class CompressNumberPipe implements PipeTransform {
  transform(value: number, args?: any): any {
    if (!value || isNaN(value)) return value;

    const suffixes = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
    const tier = (Math.log10(Math.abs(value)) / 3) | 0;

    if (tier === 0) return value.toString();

    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = value / scale;

    return scaled.toFixed(1) + suffix;
  }
}
