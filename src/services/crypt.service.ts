import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CryptModel, CryptStatus } from 'src/modules/core/models/crypt.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class CryptService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/crypt';
  }

  // Obtener la crypta actual activa
  getRewards(): Observable<any[]> {
    return this.get('/rewards');
  }

  // Obtener la crypta actual activa
  getCurrent(): Observable<CryptModel> {
    return this.get('/current');
  }

  // Iniciar una nueva crypta
  start(): Observable<CryptModel> {
    return this.post('/start', {});
  }

  // Seleccionar una recompensa en la crypta
  startExistingCrypt(cryptId: number): Observable<CryptModel> {
    return this.post(`/${cryptId}/start-existing-crypt`, {});
  }

  // Seleccionar una recompensa en la crypta
  chooseReward(cryptId: number, rewardChoice: any): Observable<CryptModel> {
    return this.post(`/${cryptId}/choose-reward`, { rewardChoice });
  }

  // Finalizar una crypta (COMPLETED o FAILED)
  endCrypt(cryptId: number, status: CryptStatus): Observable<void> {
    return this.post(`/${cryptId}/end`, { status });
  }

  startEncounter(cryptId: number, encounterId: number): Observable<void> {
    return this.post(`/${cryptId}/encounters/${encounterId}/start`, {});
  }

  // Obtener todas las cryptas según filtros
  getCrypts(
    status?: CryptStatus,
    weekStart?: string
  ): Observable<CryptModel[]> {
    let query = '';
    if (status || weekStart) {
      query = '?';
      if (status) query += `status=${status}&`;
      if (weekStart) query += `weekStart=${weekStart}`;
    }
    return this.get(query);
  }
}
