import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { disconnect } from '@wagmi/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export class ApiBaseService {
  protected controllerPrefix = '';
  private toast = inject(ToastrService);

  constructor(protected _http: HttpClient) {}

  public get(endpoint: string): Observable<any> {
    return this._http
      .get(environment.apiUrl + this.controllerPrefix + endpoint, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  public post(endpoint: string, body: any): Observable<any> {
    return this._http
      .post(environment.apiUrl + this.controllerPrefix + endpoint, body, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(
    error: HttpErrorResponse,
    caught: Observable<Object>
  ): Observable<Object> {
    if (error.status === 401) {
      disconnect();
    } else {
      this.toast.error(error.error.message);
    }
    return caught;
  }
}
