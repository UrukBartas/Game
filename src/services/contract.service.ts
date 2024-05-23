import { Injectable, inject } from '@angular/core';
import { getNetwork, readContract, writeContract } from '@wagmi/core';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private wallet = inject(WalletService);
  constructor() {}

  public executeReadContractOnUrukNFT(functionName: string, args: Array<any>) {
    return readContract({
      address: this.wallet.getChainById(getNetwork().chain.id)?.NFT,
      abi: this.wallet.getChainById(getNetwork().chain.id)?.NFT_ABI,
      functionName,
      args,
    });
  }

  public executewriteContractOnUrukNFT(
    functionName: string,
    args: Array<any>,
    value?: any
  ) {
    return writeContract({
      address: this.wallet.getChainById(getNetwork().chain.id)?.NFT,
      abi: this.wallet.getChainById(getNetwork().chain.id)?.NFT_ABI,
      functionName,
      args,
      value,
    });
  }

  public executeReadContractOnUrukERC20(
    functionName: string,
    args: Array<any>
  ) {
    return readContract({
      address: this.wallet.getChainById(getNetwork().chain.id)?.ERC20,
      abi: this.wallet.getChainById(getNetwork().chain.id)?.ERC20_ABI,
      functionName,
      args,
    });
  }

  public executewriteContractOnUrukERC20(
    functionName: string,
    args: Array<any>,
    value?: any
  ) {
    return writeContract({
      address: this.wallet.getChainById(getNetwork().chain.id)?.ERC20,
      abi: this.wallet.getChainById(getNetwork().chain.id)?.ERC20_ABI,
      functionName,
      args,
      value,
    });
  }
}
