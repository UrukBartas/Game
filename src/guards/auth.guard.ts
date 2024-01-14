import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MainState } from 'src/store/main.store';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  store = inject(Store);
  router = inject(Router);
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const storeState = this.store.selectSnapshot(MainState.getState);
    const isUserLogged = !!storeState?.user;
    const sessionExpiresAt = storeState?.session?.expiresAt;
    const sessionExpired = sessionExpiresAt
      ? new Date().getTime() > new Date(sessionExpiresAt).getTime()
      : true;

    if (!isUserLogged || sessionExpired) this.router.navigate(['/']);

    return isUserLogged && !sessionExpired;
  }
}
