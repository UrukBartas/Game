import { Inject, Injectable, InjectionToken, inject } from '@angular/core';
import { getNetwork, readContract, writeContract } from '@wagmi/core';
import { WalletService } from './wallet.service';

export const CONTRACT_TYPE = new InjectionToken<ContractTypes>('ContractType');
export enum ContractTypes {
  NFT = 'NFT',
  ERC20 = 'ERC20',
  PRESALE = 'PRESALE',
}

export class ContractService {
  private wallet = inject(WalletService);

  constructor(
    @Inject(CONTRACT_TYPE) private contractType: string,
    private chainId?: number
  ) {}

  private getContractDetails() {
    const chainId = this.chainId ?? getNetwork().chain.id;
    const chain = this.wallet.getChainById(chainId);
    if (!chain) return null;
    return {
      address: chain[this.contractType],
      abi: chain[`${this.contractType}_ABI`],
    };
  }

  protected executeReadContract<T>(
    functionName: string,
    args: Array<any>
  ): Promise<T> {
    const { address, abi } = this.getContractDetails();

    return readContract({ address, abi, functionName, args }) as Promise<T>;
  }

  protected executeWriteContract(
    functionName: string,
    args: Array<any>,
    value?: any
  ) {
    const { address, abi } = this.getContractDetails();

    return writeContract({ address, abi, functionName, args, value });
  }
}
