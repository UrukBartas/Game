import { Injectable } from '@angular/core';
import { readContract, writeContract } from '@wagmi/core';
import UrukNFTArtifact from '../assets/UrukNFT.json';
@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor() {}

  public executeReadContractOnUrukNFT(functionName: string) {
    return readContract({
      address: process.env['CONTRACT_ADDRESS'] as any,
      abi: UrukNFTArtifact.abi,
      functionName,
    });
  }

  public executewriteContractOnUrukNFT(functionName: string) {
    return writeContract({
      address: process.env['CONTRACT_ADDRESS'] as any,
      abi: UrukNFTArtifact.abi,
      functionName,
    });
  }
}
