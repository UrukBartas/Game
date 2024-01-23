import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export class ApiBaseService {
  protected controllerPrefix = '';

  constructor(protected _http: HttpClient) {}

  public get(endpoint: string): Observable<any> {
    return this._http.get(
      environment.apiUrl + this.controllerPrefix + endpoint,
      {
        withCredentials: true,
      }
    );
  }

  public post(endpoint: string, body: any): Observable<any> {
    return this._http.post(
      environment.apiUrl + this.controllerPrefix + endpoint,
      body,
      {
        withCredentials: true,
      }
    );
  }
}
