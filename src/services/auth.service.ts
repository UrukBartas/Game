import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/auth';
  }

  getAuth(): Observable<{ nonce: string }> {
    return this.get('/get-auth');
  }

  signAuth(sign: string, address: string, nonce: string): Observable<boolean> {
    return this.post('/sign-auth', { sign, address, nonce });
  }

  checkSignature(
    sign: string,
    address: string,
    nonce: string
  ): Observable<boolean> {
    return this.post('/check-signature', { sign, address, nonce });
  }
}
