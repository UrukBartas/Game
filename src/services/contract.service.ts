import { Inject, Injectable } from '@angular/core';
import { readContract, watchContractEvent, writeContract } from '@wagmi/core';
import UrukNFTArtifact from '../assets/UrukNFT.json';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { HttpClient } from '@angular/common/http';
import { Contract, ethers } from 'ethers';
import { contracts } from './ether.config';
@Injectable({
  providedIn: 'root',
})
export class ContractService extends ApiBaseService {
  public provider = new ethers.JsonRpcProvider(
    contracts['shimmer-testnet'].provider
  );
  adminWallet = new ethers.Wallet(process.env['PRIVATE_KEY'], this.provider);
  accountAWallet = new ethers.Wallet(
    process.env['EUROFIGHTER01'],
    this.provider
  );

  activeContract = new ethers.Contract(
    contracts['shimmer-testnet'].address,
    contracts['shimmer-testnet'].contractAbi,
    this.adminWallet
  ) as Contract;

  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/import-export';
  }

  public executeReadContractOnUrukNFT(functionName: string) {
    return readContract({
      address: process.env['SHIMMER_TESTNET_SC'] as any,
      abi: UrukNFTArtifact.abi,
      functionName,
    });
  }

  public executewriteContractOnUrukNFT(functionName: string, args: Array<any>) {
    return writeContract({
      address: process.env['SHIMMER_TESTNET_SC'] as any,
      abi: UrukNFTArtifact.abi,
      functionName,
      args,
    });
  }
}
