import { Injectable } from '@angular/core';
import { ContractService, ContractTypes } from '../contract.service';
import { ItemTypeSC } from 'src/modules/game/activities/export-import-nft/enums/ItemTypesSC';

@Injectable({
  providedIn: 'root',
})
export class NFTContractService extends ContractService {
  constructor() {
    super(ContractTypes.NFT);
  }

  getMintingFee() {
    return this.executeReadContract<String>('getMintingFee', null);
  }

  getItemsWhitelisted(address: string) {
    return this.executeReadContract<
      { id: number; itemType: ItemTypeSC; uri: string }[]
    >('getItemsWhitelisted', [address]);
  }

  exportItemsToNfts(args: any[], value: any) {
    return this.executeWriteContract('exportItemsToNfts', args, value);
  }

  importNftToItem(args: any[]) {
    return this.executeWriteContract('importNftToItem', args);
  }

  deletePendingExport(args: any[]) {
    return this.executeWriteContract('deletePendingExport', args);
  }
}
