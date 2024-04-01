import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { disconnect } from '@wagmi/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MainState } from 'src/store/main.store';

export class ApiBaseService {
  protected controllerPrefix = '';
  private toast = inject(ToastrService);
  private store = inject(Store);

  constructor(protected _http: HttpClient) {}

  public get(endpoint: string, ignoreError?: boolean): Observable<any> {
    return this._http
      .get(environment.apiUrl + this.controllerPrefix + endpoint, {
        withCredentials: true,
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
    if (address && response.status === 401) {
      disconnect();
    } else if (response.status !== 500 && response.error?.message) {
      if (!ignoreError) this.toast.error(response.error.message);
    }
    return throwError(() => new Error(response.error.message));
  }
}
