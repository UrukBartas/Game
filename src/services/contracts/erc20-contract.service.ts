import { Injectable } from '@angular/core';
import { BigNumberish } from 'ethers';
import { ContractService, ContractTypes } from '../contract.service';

@Injectable({
  providedIn: 'root',
})
export class ERC20ContractService extends ContractService {
  constructor() {
    super(ContractTypes.ERC20);
  }

  getExportFee() {
    return this.executeReadContract<String>('getExportFee', null);
  }

  getBalanceOf(address: string) {
    return this.executeReadContract<String>('balanceOf', [address]);
  }

  getWhitelistedCoins(address: string) {
    return this.executeReadContract<String>('getCoinsAmountWhitelisted', [
      address,
    ]);
  }

  getStakeInfo(address: string) {
    return this.executeReadContract<String>('getStakeInfo', [address]);
  }

  exportCoins(args: any[], value: any) {
    return this.executeWriteContract('exportCoins', args, value);
  }

  requestUnstake(args: any[], value: any) {
    return this.executeWriteContract('requestUnstake', args, value);
  }

  stakeTokens(args: any[], value: any) {
    return this.executeWriteContract('stakeTokens', args, value);
  }

  unstakeTokens(args: any[], value: any) {
    return this.executeWriteContract('unstakeTokens', args, value);
  }

  importCoins(args: any[]) {
    return this.executeWriteContract('importCoins', args);
  }

  /**
   * Approves the spender to spend tokens on behalf of the caller
   * @param spender The address that will spend the tokens
   * @param amount The amount of tokens to approve
   * @returns A promise that resolves to the transaction response
   */
  public approve(spender: string, amount: BigNumberish) {
    return this.executeWriteContract('approve', [spender, amount]);
  }
}
