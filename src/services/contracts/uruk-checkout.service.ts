import { inject, Injectable } from "@angular/core";
import { ethers } from "ethers";
import { firstValueFrom } from "rxjs";
import { Quote } from "src/modules/core/models/uruk-checkout.model";
import { ContractService, ContractTypes } from "../contract.service";
import { UrukCheckoutService as BackendCheckoutService } from "../uruk-checkout.service";
import { ERC20ContractService } from "./erc20-contract.service";

@Injectable({
  providedIn: 'root',
})
export class UrukCheckoutService extends ContractService {
  private erc20Service = inject(ERC20ContractService);
  private backendService = inject(BackendCheckoutService);
  constructor() {
    super(ContractTypes.CHECKOUT);
  }

  public calculateBasketFee(itemsLength: number) {
    return this.executeReadContract<string>('calculateBasketFee', [itemsLength]);
  }

  public async createAndPayBasketWithUruks(quote: Quote) {
    try {
      // Convert items to BasketItem array with proper decimal handling
      const basketItems = quote.items.map(item => ({
        itemType: item.type,
        quantity: item.quantity,
        urukPrice: ethers.parseEther(item.priceUruks.toFixed(18)),
        nativePrice: 0,
        backendId: item.id
      }));

      // Calculate total amount and approve spending
      const totalAmount = ethers.parseEther(quote.totalPriceUruks.toFixed(18));
      await this.triggerTx(
        () => this.erc20Service.approve(this.contractAddress, totalAmount),
        'Approval successful',
        true
      );

      // Execute the contract call with the new structure
      const { receipt } = await this.triggerTx(
        () => this.executeWriteContract(
          'createAndPayBasketWithUruks',
          [
            basketItems,
            quote.verificationHash,
            totalAmount
          ]
        ),
        'Payment successful',
        true
      );

      await this.executeOnBasketPaid(receipt);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      this.spinnerService.hide();
    }
  }

  private async executeOnBasketPaid(receipt: any) {
    try {
      // Buscar el evento BasketPaid en los logs
      const basketPaidLog = receipt.logs.find(log => {
        try {
          const { address, topics } = log;
          // Verificar que el log viene de nuestro contrato
          return address.toLowerCase() === this.contractAddress.toLowerCase() &&
            // El primer topic es el hash del evento
            topics[0] === ethers.id("BasketPaid(bytes32,address,bool)");
        } catch {
          return false;
        }
      });

      if (basketPaidLog) {
        const basketId = basketPaidLog.topics[1];
        await firstValueFrom(this.backendService.onBasketPaid(basketId));
      }
    } catch (error) {
      throw error;
    }
  }

  public async createAndPayBasketWithNative(quote: Quote) {
    try {
      // Format numbers with proper decimal handling
      const basePriceNative = ethers.parseEther(quote.totalPriceNative.toFixed(18));
      const basketItems = quote.items.map(item => ({
        itemType: item.type,
        quantity: item.quantity,
        urukPrice: ethers.parseEther(item.priceUruks.toFixed(18)),
        nativePrice: ethers.parseEther(item.priceNative.toFixed(18)),
        backendId: item.id
      }));

      // Get fees using the new dynamic fee calculation
      const fees = await this.calculateBasketFee(basketItems.length);
      const totalAmountToSend = basePriceNative + BigInt(fees);

      // Execute the contract call with the new structure
      const { receipt } = await this.triggerTx(
        () => this.executeWriteContract(
          'createAndPayBasketWithNative',
          [
            basketItems,
            quote.verificationHash,
            basePriceNative
          ],
          totalAmountToSend
        ),
        'Payment successful',
        true
      );

      await this.executeOnBasketPaid(receipt);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      this.spinnerService.hide();
    }
  }
}
