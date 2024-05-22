import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionModel } from 'src/modules/core/models/session.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/session';
  }

  open(): Observable<SessionModel> {
    return this.get('/open');
  }

  close(): Observable<void> {
    return this.get('/close');
  }

  public getChains() {
    return this.get(
      '/chains/' + (!!environment.production ? 'prod' : 'dev'),
      false,
      false
    );
  }
}
