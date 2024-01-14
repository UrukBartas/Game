import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionModel } from 'src/modules/core/models/session.model';
import { UserModel } from 'src/modules/core/models/user.model';
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
}
