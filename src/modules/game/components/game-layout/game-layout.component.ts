import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AccountService } from 'src/services/account.service';
import { AuthService } from 'src/services/auth.service';
import { WalletService } from 'src/services/wallet.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-game-layout',
  templateUrl: './game-layout.component.html',
  styleUrl: './game-layout.component.scss',
})
export class GameLayoutComponent {
  @Select(MainState.getAddress) address$: Observable<string>;

  public routesNavigation = [
    {
      path: '/',
      displayText: 'Character',
      icon: 'fa fa-home',
    },
  ];

  public isSidebarOpened = signal(true);
  public router = inject(Router);
  public authService = inject(AuthService);
  public accountService = inject(AccountService);
  public walletService = inject(WalletService);

  public toggleSidebarOpened(): void {
    this.isSidebarOpened.update((currentValue) => !currentValue);
  }
}
