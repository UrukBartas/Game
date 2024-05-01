import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { MainState } from 'src/store/main.store';
import { PlayerService } from './player.service';
export interface InventoryStructure {
  id: number;
}
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  store = inject(Store);
  constructor() {}

  public getInventoryStructure(size?) {
    if (size === undefined) {
      size = this.store.selectSnapshot(MainState.getState).player.sockets;
    }
    const structure = [] as Array<InventoryStructure>;
    for (let i = 0; i < size; i++) {
      structure.push({ id: i });
    }
    return structure;
  }
}
