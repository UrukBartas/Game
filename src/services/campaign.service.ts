import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
export enum CampaignType {
  RegisterReferral = 'RegisterReferral',
}
export enum CampaignStatus {
  Running = 'Running',
  Completed = 'Completed',
}

export interface CampaignDTO {
  id?: number;
  playerId: string;
  type: CampaignType;
  data: any;
  code?: string;
  status?: CampaignStatus;
}
@Injectable({
  providedIn: 'root',
})
export class CampaignService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/campaign';
  }

  getCampaignsCount(type: string): Observable<number> {
    return this.http.get(
      environment.apiUrl +
        this.controllerPrefix +
        '/get-campaigns-length/' +
        type
    ) as Observable<number>;
  }

  generateCampaign(campaign: CampaignDTO) {
    return this.http.post(
      environment.apiUrl + this.controllerPrefix + '/generate-campaign',
      campaign
    );
  }
}
