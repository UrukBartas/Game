import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toIpfsImageFromCid',
  standalone: true,
})
export class ToIpfsImageFromCidPipe implements PipeTransform {
  transform(CID: string, ...args: unknown[]): string {
    return 'https://' + CID + '.ipfs.nftstorage.link/';
  }
}
