import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { PVPHistoricModel } from 'src/modules/game/components/fight-historic/models/pvp-historic.model';

@Injectable({
  providedIn: 'root',
})
export class PvPFightService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/pvp';
  }

  getLastMatch(): Observable<PVPHistoricModel> {
    return this.get('/last-match');
  }

  getHistoric(
    address: string,
    limit: number,
    offset: number
  ): Observable<PVPHistoricModel[]> {
    return this.post('/historic', {
      address,
      limit,
      offset,
    });
  }
}
