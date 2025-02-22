import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MiscellanyItemIdentifier } from 'src/modules/core/models/misc.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

export interface Referral {
  id: number;
  inviterId: string;
  inviteeId: string;
  createdAt: Date;
  completed: boolean; // Whether the referred player reached the required level

  // Relations
  inviter: PlayerModel; // The player who invited
  invitee: PlayerModel; // The player who was invited
}

interface RewardTier {
  required: number;
  mount: MiscellanyItemIdentifier;
  tier: number;
  image: string;
}

interface RewardStatus {
  mount: MiscellanyItemIdentifier;
  required: number;
  tier: number;
  available: boolean;
  progress: number;
  currentCount: number;
  name: string;
  description: string;
  image: string;
  rarity: string;
  // Añade cualquier otro campo que tenga miscellanyItemData que necesites
}

interface RewardsResponse {
  totalRecruits: number;
  rewards: RewardStatus[];
}

@Injectable({
  providedIn: 'root',
})
export class ReferralService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/referrals';
  }

  public getReferralCode(): Observable<{ code: string }> {
    return this.get('/code');
  }

  public generateReferralCode(): Observable<{ code: string }> {
    return this.get('/generate');
  }

  public getRecruiter(): Observable<PlayerModel> {
    return this.get('/recruiter');
  }

  public getRecruitedPlayers(): Observable<PlayerModel[]> {
    return this.get('/recruited');
  }

  public getCurrentRewards(): Observable<RewardsResponse> {
    return this.get('/rewards');
  }
}
