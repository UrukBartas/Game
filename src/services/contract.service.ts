import { Injectable } from '@angular/core';
import { readContract, watchNetwork, writeContract } from '@wagmi/core';
import UrukNFTArtifact from '../assets/UrukNFT.json';
import GoldenUruks from '../assets/GoldenUruks.json';
import { BehaviorSubject, delay, filter, switchMap } from 'rxjs';
import { getChainById } from './wallet.service';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  public activeChainId = new BehaviorSubject(-1);

  constructor() {
    watchNetwork((network) => {
      this.activeChainId.next(network.chain.id);
    });
  }

  public executeReadContractOnUrukNFT(functionName: string, args: Array<any>) {
    return this.activeChainId.pipe(
      filter((value) => value > 0),
      switchMap((value) => {
        return readContract({
          address: getChainById(value).NFT,
          abi: UrukNFTArtifact.abi,
          functionName,
          args,
        });
      })
    );
  }

  public executewriteContractOnUrukNFT(functionName: string, args: Array<any>) {
    return this.activeChainId.pipe(
      filter((value) => value > 0),
      switchMap((value) => {
        return writeContract({
          address: getChainById(value).NFT,
          abi: UrukNFTArtifact.abi,
          functionName,
          args,
        });
      })
    );
  }

  public executeReadContractOnUrukERC20(
    functionName: string,
    args: Array<any>
  ) {
    return this.activeChainId.pipe(
      filter((value) => value > 0),
      switchMap((value) => {
        return readContract({
          address: getChainById(value).ERC20,
          abi: GoldenUruks.abi,
          functionName,
          args,
        });
      })
    );
  }

  public executewriteContractOnUrukERC20(
    functionName: string,
    args: Array<any>
  ) {
    return this.activeChainId.pipe(
      filter((value) => value > 0),
      switchMap((value) => {
        return writeContract({
          address: getChainById(value).ERC20,
          abi: GoldenUruks.abi,
          functionName,
          args,
        });
      })
    );
  }
}
