import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/user';
  }

  createCharacter(
    email: string,
    name: string,
    image: string
  ): Observable<boolean> {
    return this.post('/create', { email, name, image });
  }
}
