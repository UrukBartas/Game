import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/services/account.service';
import { AuthService } from 'src/services/auth.service';
import { take } from 'rxjs';
import { signMessage, getAccount } from '@wagmi/core';

@Component({
  selector: 'app-game-layout',
  templateUrl: './game-layout.component.html',
  styleUrl: './game-layout.component.scss',
})
export class GameLayoutComponent {
  public routesNavigation = [
    {
      path: '/',
      displayText: 'Character',
      icon: 'fa fa-home',
    },
  ];
  public isSidebarOpened = signal(true);
  public router = inject(Router);
  public accountService = inject(AccountService);
  public authService = inject(AuthService);
  constructor() {
    this.accountService.modal.subscribeEvents(console.log);
  }

  public toggleSidebarOpened(): void {
    this.isSidebarOpened.update((currentValue) => !currentValue);
  }

  public logIn() {
    this.authService
      .getAuth()
      .pipe(take(1))
      .subscribe(async ({ nonce }) => {
        const message = `Sign this message to authenticate your Ethereum address: ${nonce}`;
        const sign = await signMessage({ message });
        const address: string = getAccount().address ?? '';

        this.authService
          .signAuth(sign, address, nonce)
          .pipe(take(1))
          .subscribe(console.log);
      });
  }

  public async signMessage(provider, message) {
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
  }
}
