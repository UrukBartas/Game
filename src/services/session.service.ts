import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Realm, SessionModel } from 'src/modules/core/models/session.model';
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
    return this.get('/chains/', false, false);
  }

  public getRealms(): Observable<Array<Realm>> {
    return this.get('/realms/', false, false);
  }
}
