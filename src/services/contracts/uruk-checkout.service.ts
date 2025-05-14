import { inject, Injectable } from "@angular/core";
import { ethers } from "ethers";
import { Quote } from "src/modules/core/models/uruk-checkout.model";
import { ContractService, ContractTypes } from "../contract.service";
import { ERC20ContractService } from "./erc20-contract.service";

@Injectable({
  providedIn: 'root',
})
export class UrukCheckoutService extends ContractService {
  private erc20Service = inject(ERC20ContractService);

  constructor() {
    super(ContractTypes.CHECKOUT);
  }

  public calculateBasketFee(itemsLength: number) {
    return this.executeReadContract<string>('calculateBasketFee', [itemsLength]);
  }

  public async createAndPayBasketWithUruks(quote: Quote) {
    // Prepare parameters for the contract call
    const types = quote.items.map(item => item.type);
    const quantities = quote.items.length;
    const urukPrices = quote.items.map(item => item.priceUruks);
    const nativePrices = Array(quote.items.length).fill(0); // Not used for URUK payment
    const backendIds = quote.items.map(item => item.id);
    const totalAmount = ethers.parseUnits(quote.totalPriceUruks.toString(), 18);

    // Execute the contract call
    return this.executeWriteContract(
      'createAndPayBasketWithUruks',
      [
        types,
        quantities,
        urukPrices,
        nativePrices,
        backendIds,
        quote.verificationHash,
        totalAmount
      ]
    );
  }

  public async createAndPayBasketWithNative(quote: Quote) {
    // Calculate total amount including fees
    const fee = await this.calculateBasketFee(quote.items.length);
    const totalAmount = ethers.parseUnits(
      (quote.totalPriceNative + Number(ethers.formatUnits(fee, 18))).toString(),
      18
    );

    // Prepare parameters for the contract call
    const types = quote.items.map(item => item.type);
    const quantities = quote.items.length;
    const urukPrices = quote.items.map(item => item.priceUruks);
    const nativePrices = quote.items.map(() => quote.totalPriceNative);
    const backendIds = quote.items.map(item => item.id);

    // Execute the contract call with value
    return this.executeWriteContract(
      'createAndPayBasketWithNative',
      [
        types,
        quantities,
        urukPrices,
        nativePrices,
        backendIds,
        quote.verificationHash
      ],
      { value: totalAmount }
    );
  }
}
