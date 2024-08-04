import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventoryUpdateService {
  updateAllInventory$ = new Subject();
}
