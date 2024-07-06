import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { getAccount } from '@wagmi/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/services/auth.service';
import { WalletService } from 'src/services/wallet.service';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState } from 'src/store/main.store';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  store = inject(Store);
  router = inject(Router);
  toastService = inject(ToastrService);
  websocket = inject(WebSocketService);
  authService = inject(AuthService);
  walletService = inject(WalletService);

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const storeState = this.store.selectSnapshot(MainState.getState);
    const isPlayerLogged = !!storeState?.player;
    const sessionExpiresAt = storeState?.session?.expiresAt;
    const sessionExpired = sessionExpiresAt
      ? new Date().getTime() > new Date(sessionExpiresAt).getTime()
      : true;
    let isDisconnected = false;
    try {
      isDisconnected = getAccount()?.isDisconnected;
    } catch (error) {
      isDisconnected = false;
    }

    if (isDisconnected && !this.authService.loggedWithEmail()) {
      this.toastService.warning('Please connect your wallet');
    }

    if (
      !isPlayerLogged ||
      sessionExpired ||
      (isDisconnected && !this.authService.loggedWithEmail())
    )
      this.router.navigate(['/']);

    const isPlayerAuthorized = isPlayerLogged && !sessionExpired;

    if (isPlayerAuthorized && !this.websocket.socket?.active) {
      this.websocket.connect();
    }

    return isPlayerAuthorized;
  }
}
