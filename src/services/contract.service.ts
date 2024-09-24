import { Inject, InjectionToken, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  getNetwork,
  readContract,
  waitForTransaction,
  writeContract,
} from '@wagmi/core';

import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RefreshPlayer } from 'src/store/main.store';
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

  private spinnerService = inject(NgxSpinnerService);
  private store = inject(Store);
  private toastService = inject(ToastrService);

  public async triggerTx(tx: Function, mesasge?: string) {
    this.spinnerService.show();
    try {
      const txRes = await tx();
      const receipt = await waitForTransaction({
        hash: txRes.hash,
      });
      this.toastService.success(
        mesasge ?? 'Transaction completed successfully!'
      );
      this.store.dispatch(new RefreshPlayer());
    } catch (error) {
      this.toastService.error('Eror during transaction - Transaction canceled');
    }
    this.spinnerService.hide();
  }

  public executeReadContractOnUrukNFT(functionName: string, args: Array<any>) {
    return readContract({
      address: this.wallet.getChainById(getNetwork().chain.id)?.NFT,
      abi: this.wallet.getChainById(getNetwork().chain.id)?.NFT_ABI,
      functionName,
      args,
    });
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
