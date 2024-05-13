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
}
