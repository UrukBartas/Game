import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { getAccount } from '@wagmi/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
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

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const storeState = this.store.selectSnapshot(MainState.getState);
    const isPlayerLogged = !!storeState?.player;
    const sessionExpiresAt = storeState?.session?.expiresAt;
    const sessionExpired = sessionExpiresAt
      ? new Date().getTime() > new Date(sessionExpiresAt).getTime()
      : true;
    const { isDisconnected } = getAccount();

    if (isDisconnected) {
      this.toastService.warning('Please connect your wallet');
    }

    if (!isPlayerLogged || sessionExpired || isDisconnected)
      this.router.navigate(['/']);

    const isPlayerAuthorized = isPlayerLogged && !sessionExpired;

    if (isPlayerAuthorized && !this.websocket.socket?.active) {
      this.websocket.connect();
    }

    return isPlayerAuthorized;
  }
}
