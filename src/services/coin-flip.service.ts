import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

export interface FlipHistory {
  id: string;
  playerId: string;
  betAmount: number;
  selectedOutcome: string;
  resultOutcome: string;
  winAmount: number;
  rewardItems?: Array<{ itemId: string; quantity: number }>;
  createdAt: string;
}

export interface CoinFlipResult {
  flipId: string;
  resultOutcome: string;
  isWin: boolean;
  winAmount: number;
  rewardItems?: Array<{ itemId: string; quantity: number }>;
  newBalance: number;
}

export interface CoinFlipLeaderboard {
  topWinStreaks: WinStreakEntry[];
  topBets: TopBetEntry[];
  topWinners: TopWinnerEntry[];
}

export interface WinStreakEntry {
  playerId: string;
  playerName: string;
  winStreak: number;
}

export interface TopBetEntry {
  playerId: string;
  playerName: string;
  betAmount: number;
  winAmount: number;
  outcome: string;
  date: string;
}

export interface TopWinnerEntry {
  playerId: string;
  playerName: string;
  totalWinnings: number;
}

export interface CoinFlipStats {
  totalFlips: number;
  totalBetAmount: number;
  totalWinAmount: number;
  houseEdge: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoinFlipService extends ApiBaseService {

  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/coin-flip';
  }

  flip(betAmount: number, selectedOutcome: string): Observable<CoinFlipResult> {
    return this.post('/flip', {
      betAmount,
      selectedOutcome
    });
  }

  getFlipHistory(limit?: number): Observable<FlipHistory[]> {
    return this.post('/history', {
      params: { limit: limit?.toString() }
    });
  }

  getLeaderboard(): Observable<CoinFlipLeaderboard> {
    return this.get('/leaderboard');
  }

  getStats(): Observable<CoinFlipStats> {
    return this.get('/stats');
  }
}
