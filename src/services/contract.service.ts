import { Inject, InjectionToken, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  getNetwork,
  readContract,
  switchNetwork,
  waitForTransaction,
  writeContract,
} from '@wagmi/core';

import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { filter, firstValueFrom } from 'rxjs';
import { RefreshPlayer } from 'src/store/main.store';
import { WalletService } from './wallet.service';

export const CONTRACT_TYPE = new InjectionToken<ContractTypes>('ContractType');
export enum ContractTypes {
  NFT = 'NFT',
  ERC20 = 'ERC20',
  PRESALE = 'PRESALE',
  CHECKOUT = 'CHECKOUT'
}

export class ContractService {
  private wallet = inject(WalletService);

  constructor(
    @Inject(CONTRACT_TYPE) private contractType: string,
    private chainId?: number
  ) { }

  /**
   * Gets the contract address for the current chain
   * @returns The contract address
   */
  protected get contractAddress(): string {
    const details = this.getContractDetails();
    if (!details) throw new Error('Contract details not found');
    return details.address;
  }

  private getContractDetails() {
    const chainId = this.chainId ?? getNetwork().chain.id;
    const chain = this.wallet.getChainById(chainId);
    if (!chain) return null;
    return {
      address: chain[this.contractType],
      abi: chain[`${this.contractType}_ABI`],
    };
  }

  protected spinnerService = inject(NgxSpinnerService);
  private store = inject(Store);
  private toastService = inject(ToastrService);

  public async triggerTx(tx: Function, mesasge?: string, avoidStoppingSpinner = false) {
    this.spinnerService.show();
    try {
      const txRes = await tx();
      const receipt = await waitForTransaction({
        hash: txRes.hash,
        confirmations: 1
      });

      this.toastService.success(
        mesasge ?? 'Transaction completed successfully!'
      );
      this.store.dispatch(new RefreshPlayer());

      return {
        receipt,
        hash: txRes.hash,
        logs: receipt.logs
      };
    } catch (error: any) {
      this.toastService.error(
        'Error during transaction - Transaction canceled',
        error?.shortMessage ?? ''
      );
      throw error;
    } finally {
      if (!avoidStoppingSpinner) this.spinnerService.hide();
    }
  }

  protected async executeReadContract<T>(
    functionName: string,
    args: Array<any>
  ): Promise<T> {
    if (!this.wallet.allowChainConnected()) {
      await this.autoConnectToValidChain();
      const res = await this.executeReadContract<T>(functionName, args);
      return res;
    } else {
      const { address, abi } = this.getContractDetails();
      return readContract({ address, abi, functionName, args }) as Promise<T>;
    }
  }

  protected async executeWriteContract(
    functionName: string,
    args: Array<any>,
    value?: any
  ) {
    if (!this.wallet.allowChainConnected()) {
      await this.autoConnectToValidChain();
      return this.executeWriteContract(functionName, args, value);
    } else {
      const { address, abi } = this.getContractDetails();
      return writeContract({ address, abi, functionName, args, value });
    }
  }

  public async autoConnectToValidChain() {
    const currentChain = getNetwork().chain.id;
    const validChains = await firstValueFrom(
      this.wallet.chains.pipe(filter((e) => e.length > 0))
    );
    if (validChains.some((e) => e.id === currentChain)) {
      await switchNetwork({ chainId: currentChain });
    } else {
      await switchNetwork({ chainId: validChains[0].id });
    }
  }
}
