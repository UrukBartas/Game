import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { getNetwork, switchNetwork, watchNetwork } from '@wagmi/core';
import { BehaviorSubject } from 'rxjs';
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
  public activeNetworkId = new BehaviorSubject<number>(0);
  @Output() networkChanged = new EventEmitter<number>();
  public changeNetwork(chainId: number) {
    switchNetwork({ chainId });
    this.networkChanged.emit(chainId);
  }

  constructor() {
    this.walletService.getValidAddress$.subscribe(() => {
      this.activeNetworkId.next(getNetwork()?.chain?.id);
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeNetworkId.next(getNetwork()?.chain?.id);
      }
    });
  }

  ngOnInit(): void {
    this.walletService.getValidAddress$.subscribe(() => {
      watchNetwork((network) => {
        try {
          const isAllowed = this.walletService.chains
            .getValue()
            .find((chain) => chain.id == network.chain.id);
          if (!!isAllowed) {
            this.activeNetworkId.next(network.chain.id);
          } else {
            this.activeNetworkId.next(0);
          }
        } catch (error) {
          this.activeNetworkId.next(0);
        }
      });
    });
  }
}
