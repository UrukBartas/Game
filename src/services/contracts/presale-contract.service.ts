import { Injectable } from '@angular/core';
import { ContractService, ContractTypes } from '../contract.service';

export enum LootboxPresaleTypeEnum {
  COMMON = 0,
  UNCOMMON = 1,
  EPIC = 2,
  LEGENDARY = 3,
  MYTHIC = 4,
}

export const SHIMMER_TESTNET_CHAINID = 1073;

@Injectable({
  providedIn: 'root',
})
export class PresaleContractService extends ContractService {
  constructor() {
    super(ContractTypes.PRESALE, SHIMMER_TESTNET_CHAINID);
  }

  getBoughtLootboxesOfType(lootboxType: LootboxPresaleTypeEnum) {
    return this.executeReadContract<any[]>('lootboxes', [lootboxType]);
  }

  mintLootbox(
    address: string,
    lootboxType: LootboxPresaleTypeEnum,
    price: bigint
  ) {
    return this.executeWriteContract('safeMint', [address, lootboxType], price);
  }

  mintMultipleLootboxes(
    quantity: number,
    address: string,
    lootboxType: LootboxPresaleTypeEnum,
    price: bigint
  ) {
    return this.executeWriteContract('mintMultipleLootboxes', [quantity, address, lootboxType], price);
  }
}
