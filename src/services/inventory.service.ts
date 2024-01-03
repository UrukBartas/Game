import { Injectable } from '@angular/core';
export interface InventoryStructure {
  id: number;
}
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor() {}

  public getInventoryStructure(size = 80) {
    const structure = [] as Array<InventoryStructure>;
    for (let i = 0; i < size; i++) {
      structure.push({ id: i });
    }
    return structure;
  }
}
