import { Injectable, inject } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private wallet = inject(WalletService);
  private spinnerService = inject(NgxSpinnerService);
  private store = inject(Store);
  private toastService = inject(ToastrService);
  constructor() {}

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
