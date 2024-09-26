import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { switchNetwork } from '@wagmi/core';
import { WalletService } from 'src/services/wallet.service';
import { ItemBoxComponent } from '../item-box/item-box.component';

@Component({
  selector: 'app-chain-switcher',
  standalone: true,
  imports: [CommonModule, ItemBoxComponent],
  templateUrl: './chain-switcher.component.html',
  styleUrl: './chain-switcher.component.scss',
})
export class ChainSwitcherComponent {
  walletService = inject(WalletService);
  router = inject(Router);

  @Output() networkChanged = new EventEmitter<number>();

  public changeNetwork(chainId: number) {
    switchNetwork({ chainId });
    this.networkChanged.emit(chainId);
  }

  constructor() {}
}
