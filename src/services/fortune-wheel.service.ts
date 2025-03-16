import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

export interface SpinResult {
  spinId: string;
  resultMultiplier: number;
  isWin: boolean;
  winAmount: number;
  newBalance: number;
}

export interface SpinHistory {
  id: string;
  betAmount: number;
  selectedMultiplier: number;
  resultMultiplier: number;
  winAmount: number;
  createdAt: string;
}

export interface WheelStats {
  totalSpins: number;
  totalBetAmount: number;
  totalWinAmount: number;
  houseEdge: number;
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
  multiplier: number;
  date: string;
}

export interface TopWinnerEntry {
  playerId: string;
  playerName: string;
  totalWinnings: number;
}

export interface FortuneWheelLeaderboard {
  topWinStreaks: WinStreakEntry[];
  topBets: TopBetEntry[];
  topWinners: TopWinnerEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class FortuneWheelService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/fortune-wheel';
  }


  /**
   * Realiza un giro en la ruleta
   * @param betAmount Cantidad apostada
   * @param selectedMultiplier Multiplicador seleccionado
   * @returns Observable con el resultado del giro
   */
  spin(betAmount: number, selectedMultiplier: number): Observable<SpinResult> {
    return this.post('/spin', {
      betAmount,
      selectedMultiplier
    });
  }

  /**
   * Obtiene el historial de giros del jugador
   * @param limit Número máximo de registros a obtener
   * @returns Observable con el historial de giros
   */
  getSpinHistory(limit?: number): Observable<SpinHistory[]> {
    const params = limit ? { limit: limit.toString() } : {};
    return this.post('/history', { params });
  }

  /**
   * Obtiene estadísticas generales de la ruleta
   * @returns Observable con las estadísticas
   */
  getWheelStats(): Observable<WheelStats> {
    return this.get('/stats');
  }

  /**
   * Obtiene el leaderboard de la ruleta con las mejores rachas, apuestas y ganadores
   * @returns Observable con los datos del leaderboard
   */
  getLeaderboard(): Observable<FortuneWheelLeaderboard> {
    return this.get('/leaderboard');
  }
}