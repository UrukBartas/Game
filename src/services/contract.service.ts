import { Injectable } from '@angular/core';
import {
  getNetwork,
  readContract,
  watchNetwork,
  writeContract,
} from '@wagmi/core';
import UrukNFTArtifact from '../assets/UrukNFT.json';
import GoldenUruks from '../assets/GoldenUruks.json';
import { BehaviorSubject, delay, filter, switchMap } from 'rxjs';
import { getChainById } from './wallet.service';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor() {}

  public executeReadContractOnUrukNFT(functionName: string, args: Array<any>) {
    return readContract({
      address: getChainById(getNetwork().chain.id).NFT,
      abi: UrukNFTArtifact.abi,
      functionName,
      args,
    });
  }

  public executewriteContractOnUrukNFT(functionName: string, args: Array<any>) {
    return writeContract({
      address: getChainById(getNetwork().chain.id).NFT,
      abi: UrukNFTArtifact.abi,
      functionName,
      args,
    });
  }

  public executeReadContractOnUrukERC20(
    functionName: string,
    args: Array<any>
  ) {
    return readContract({
      address: getChainById(getNetwork().chain.id).ERC20,
      abi: GoldenUruks.abi,
      functionName,
      args,
    });
  }

  public executewriteContractOnUrukERC20(
    functionName: string,
    args: Array<any>
  ) {
    return writeContract({
      address: getChainById(getNetwork().chain.id).ERC20,
      abi: GoldenUruks.abi,
      functionName,
      args,
    });
  }
}
