import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/player';
  }

  create(email: string, name: string, image: string): Observable<PlayerModel> {
    return this.post('/create', { email, name, image });
  }

  update(email: string, name: string, image: string): Observable<PlayerModel> {
    return this.post('/update', { email, name, image });
  }

  getItems() {
    return this.get('/inventory');
  }
}
