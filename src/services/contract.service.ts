import { Inject, Injectable } from '@angular/core';
import { readContract, watchContractEvent, writeContract } from '@wagmi/core';
import UrukNFTArtifact from '../assets/UrukNFT.json';
import GoldenUruks from '../assets/GoldenUruks.json';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { HttpClient } from '@angular/common/http';
import { Contract, ethers } from 'ethers';
@Injectable({
  providedIn: 'root',
})
export class ContractService extends ApiBaseService {
  public provider = new ethers.JsonRpcProvider(process.env['PROVIDER']);
  adminWallet = new ethers.Wallet(process.env['PRIVATE_KEY'], this.provider);
  accountAWallet = new ethers.Wallet(
    process.env['EUROFIGHTER01'],
    this.provider
  );

  activeContract = new ethers.Contract(
    process.env['SHIMMER_TESTNET_SC'],
    UrukNFTArtifact.abi,
    this.adminWallet
  ) as Contract;

  activeContractERC20 = new ethers.Contract(
    process.env['SHIMMER_TESTNET_ERC20'],
    GoldenUruks.abi,
    this.adminWallet
  ) as Contract;

  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/import-export';
  }

  public executeReadContractOnUrukNFT(functionName: string, args: Array<any>) {
    return readContract({
      address: process.env['SHIMMER_TESTNET_SC'] as any,
      abi: UrukNFTArtifact.abi,
      functionName,
      args,
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

  public executeReadContractOnUrukERC20(
    functionName: string,
    args: Array<any>
  ) {
    return readContract({
      address: process.env['SHIMMER_TESTNET_ERC20'] as any,
      abi: GoldenUruks.abi,
      functionName,
      args,
    });
  }

  public executewriteContractOnUrukERC20(
    functionName: string,
    args: Array<any>
  ) {
    return writeContract({
      address: process.env['SHIMMER_TESTNET_ERC20'] as any,
      abi: GoldenUruks.abi,
      functionName,
      args,
    });
  }
}
