import { Injectable } from '@angular/core';
import { ContractService, ContractTypes } from '../contract.service';

export enum LootboxPresaleTypeEnum {
  COMMON = 0,
  UNCOMMON = 1,
  EPIC = 2,
  LEGENDARY = 3,
  MYTHIC = 4,
}

@Injectable({
  providedIn: 'root',
})
export class PresaleContractService extends ContractService {
  constructor() {
    super(ContractTypes.PRESALE);
  }

  getBoughtLootboxesOfType(lootboxType: LootboxPresaleTypeEnum) {
    return this.executeReadContract<any[]>('lootboxes', [lootboxType]);
  }

  importNftToGame(args: any[]) {
    return this.executeWriteContract('importNftToGame', args);
  }

  mintMultipleLootboxes(
    quantity: number,
    address: string,
    lootboxType: LootboxPresaleTypeEnum,
    price: bigint
  ) {
    return this.executeWriteContract(
      'mintMultipleLootboxes',
      [quantity, address, lootboxType],
      price
    );
  }
}
