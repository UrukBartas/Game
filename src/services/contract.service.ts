import { Inject, Injectable } from '@angular/core';
import { readContract, writeContract } from '@wagmi/core';
import UrukNFTArtifact from '../assets/UrukNFT.json';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { HttpClient } from '@angular/common/http';
import { HelmetModel } from 'src/modules/core/models/items.model';
@Injectable({
  providedIn: 'root',
})
export class ContractService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/import-export';
  }

  public executeReadContractOnUrukNFT(functionName: string) {
    return readContract({
      address: process.env['CONTRACT_ADDRESS_URUK'] as any,
      abi: UrukNFTArtifact.abi,
      functionName,
    });
  }

  public executewriteContractOnUrukNFT(functionName: string, args: Array<any>) {
    return writeContract({
      address: process.env['CONTRACT_ADDRESS_URUK'] as any,
      abi: UrukNFTArtifact.abi,
      functionName,
      args,
    });
  }

  public whiteListItem(itemId: string, address: string) {
    return this.post('/whitelist-export/' + address + '/' + itemId, {});
  }

  public uploadJsonMetadataNFT(item: HelmetModel) {
    return this.post('/upload-metadata', item);
  }
}
