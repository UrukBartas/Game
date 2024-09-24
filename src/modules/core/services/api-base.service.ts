import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DisconnectWallet, MainState } from 'src/store/main.store';

export class ApiBaseService {
  protected controllerPrefix = '';
  protected toast = inject(ToastrService);
  protected store = inject(Store);
  protected spinnerService = inject(NgxSpinnerService);

  constructor(protected _http: HttpClient) {}

  public get(
    endpoint: string,
    ignoreError?: boolean,
    withCredentials = true
  ): Observable<any> {
    return this._http
      .get(environment.apiUrl + this.controllerPrefix + endpoint, {
        withCredentials,
      })
      .pipe(catchError((err) => this.handleError(err, ignoreError)));
  }

  public delete(
    endpoint: string,
    ignoreError?: boolean,
    withCredentials = true
  ): Observable<any> {
    return this._http
      .delete(environment.apiUrl + this.controllerPrefix + endpoint, {
        withCredentials,
      })
      .pipe(catchError((err) => this.handleError(err, ignoreError)));
  }

  public post(
    endpoint: string,
    body: any,
    ignoreError?: boolean
  ): Observable<any> {
    return this._http
      .post(environment.apiUrl + this.controllerPrefix + endpoint, body, {
        withCredentials: true,
      })
      .pipe(catchError((err) => this.handleError(err, ignoreError)));
  }

  private handleError(
    response: HttpErrorResponse,
    ignoreError: boolean
  ): Observable<Object> {
    const { address } = this.store.selectSnapshot(MainState.getState);
    let message;

    if (response.error?.message) {
      if (typeof response.error?.message === 'string') {
        message = response.error?.message;
      } else {
        message = response.error?.message.message;
      }
    }

    if (address && response.status === 401) {
      this.store.dispatch(new DisconnectWallet());
    } else if (response.status !== 500 && message) {
      if (!ignoreError) this.toast.error(message);
    }

    return throwError(() => new Error(message));
  }
}
