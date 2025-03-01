import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { map, Observable, of, switchMap } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { MainState } from 'src/store/main.store';
import { AUTH_TOKEN_KEY } from './http-uruk.interceptor';
@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiBaseService {
  //Disabled for now to test if web3 can be deployed
  public nativePlatform = Capacitor.isNativePlatform();
  //public nativePlatform = true;
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/auth';
  }

  public loggedWithEmail = () => {
    const storeState = this.store.selectSnapshot(MainState.getState);
    return !!storeState?.session?.loginWithMail;
  };

  loginPlayer(email: string, password: string) {
    return this.post('/login', { email, password }).pipe(
      switchMap(({ user, token }) => {
        return of(
          Preferences.set({
            key: AUTH_TOKEN_KEY,
            value: token,
          })
        ).pipe(map(() => token));
      })
    );
  }

  getAuth(): Observable<{ nonce: string }> {
    return this.get('/get-auth');
  }

  signAuth(sign: string, address: string, nonce: string): Observable<string> {
    return this.post('/sign-auth', { sign, address, nonce }).pipe(
      switchMap(({ token }) => {
        return of(
          Preferences.set({
            key: AUTH_TOKEN_KEY,
            value: token,
          })
        ).pipe(map(() => token));
      })
    );
  }

  checkSignature(
    sign: string,
    address: string,
    nonce: string
  ): Observable<boolean> {
    return this.post('/check-signature', { sign, address, nonce });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.post('/request-password-reset', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.post('/reset-password', { token, newPassword });
  }

  verifyEmail(token: string): Observable<any> {
    return this.post('/verify-email', { token });
  }

  requestEmailVerification() {
    return this.post('/request-verification', {});
  }
}
