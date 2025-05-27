import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { CoinFlipLeaderboard, CoinFlipService, FlipHistory } from 'src/services/coin-flip.service';
import { ViewportService } from 'src/services/viewport.service';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';

interface CoinFlipOutcome {
  outcome: string;
  color: string;
  label: string;
  image?: string;
}

@Component({
  selector: 'app-coin-flip',
  templateUrl: './coin-flip.component.html',
  styleUrls: ['./coin-flip.component.scss']
})
export class CoinFlipComponent implements OnInit, AfterViewInit {
  @ViewChild('coin') coinElement: ElementRef<HTMLDivElement>;

  public prefix = ViewportService.getPreffixImg();
  public betAmount = new FormControl(10, [Validators.required, Validators.min(1), Validators.max(5000)]);
  public isFlipping = false;
  public lastResult: { outcome: string, winAmount: number, rewardItems?: Array<{ itemId: string; quantity: number }> } | null = null;
  public playerBalance$ = this.store.select(MainState.getPlayer).pipe(map(player => player.uruks || 0));
  public selectedOutcome: string | null = null;
  public flipHistory: FlipHistory[] = [];
  public isLoadingHistory = false;
  public leaderboard: CoinFlipLeaderboard | null = null;
  public isLoadingLeaderboard = false;

  // Configuración de outcomes disponibles
  public outcomes: CoinFlipOutcome[] = [
    { outcome: 'heads', color: '#FFD700', label: 'Heads', image: '/assets/coin-heads.png' },
    { outcome: 'tails', color: '#C0C0C0', label: 'Tails', image: '/assets/coin-tails.png' },
    { outcome: 'goblin', color: '#8B4513', label: 'Goblin', image: '/assets/coin-goblin.png' }
  ];

  // Estado de la animación
  private flipDuration = 2500; // 2.5 segundos
  private isAnimating = false;
  private flipTimeout: any;
  public Math = Math;

  constructor(
    private toastr: ToastrService,
    private viewportService: ViewportService,
    private coinFlipService: CoinFlipService,
    private store: Store,
    private websocket: WebSocketService
  ) {
    this.websocket.connect();
    this.listenForFOMOEvents();
  }

  ngOnDestroy(): void {
    this.websocket.socket.off('epicCoinFlip');
    this.websocket.socket.off('winStreakCoinFlip');
    if (this.flipTimeout) {
      clearTimeout(this.flipTimeout);
    }
  }

  private async listenForFOMOEvents() {
    const currentPlayer = await firstValueFrom(this.store.select(MainState.getPlayer));

    this.websocket.socket.on('epicCoinFlip', (data: any) => {
      if (data.playerId != currentPlayer.id) this.showFomoToast(data.message);
    });

    this.websocket.socket.on('winStreakCoinFlip', (data: any) => {
      if (data.playerId != currentPlayer.id) this.showFomoToast(data.message);
    });
  }

  showFomoToast(message: string) {
    this.toastr.success(`🎰 ${message} 🎰`, 'Epic Win! 🔥', {
      timeOut: 4000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
      progressAnimation: 'increasing',
      tapToDismiss: false,
      newestOnTop: true,
    });
  }

  ngOnInit(): void {
    this.loadFlipHistory();
    this.loadLeaderboard();
  }

  ngAfterViewInit(): void {
    // Inicializar la moneda mostrando heads por defecto
    this.resetCoinAnimation();
    if (this.coinElement) {
      this.coinElement.nativeElement.setAttribute('data-show', 'heads');
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    // Manejar cambios de tamaño si es necesario
  }

  private loadFlipHistory(): void {
    this.isLoadingHistory = true;
    this.coinFlipService.getFlipHistory(10)
      .pipe(finalize(() => this.isLoadingHistory = false))
      .subscribe({
        next: (history) => {
          this.flipHistory = history;
        },
        error: (error) => {
          console.error('Error loading flip history:', error);
        }
      });
  }

  private loadLeaderboard(): void {
    this.isLoadingLeaderboard = true;
    this.coinFlipService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard = data;
        this.isLoadingLeaderboard = false;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        this.isLoadingLeaderboard = false;
      }
    });
  }

  public async flipCoin(): Promise<void> {
    if (this.isFlipping || !this.betAmount.valid || !this.selectedOutcome) return;

    const betAmount = this.betAmount.value;
    const playerBalance = await firstValueFrom(this.playerBalance$);
    if (betAmount > playerBalance) {
      this.toastr.error('Insufficient uruks for this bet');
      return;
    }

    this.isFlipping = true;

    this.coinFlipService.flip(betAmount, this.selectedOutcome)
      .subscribe({
        next: (result) => {
          // Guardar el resultado para mostrarlo después
          this.lastResult = {
            outcome: result.resultOutcome,
            winAmount: result.winAmount,
            rewardItems: result.rewardItems
          };

          // Iniciar la animación de la moneda
          this.animateCoinFlip(result.resultOutcome);

          this.store.dispatch(new RefreshPlayer());
          // Recargar el historial
          this.loadFlipHistory();
        },
        error: (error) => {
          this.handleFlipError(error.error?.message || 'Error flipping the coin');
        }
      });
  }

  private handleFlipError(message: string): void {
    this.isFlipping = false;
    this.toastr.error(message);
    console.error('Flip error:', message);
    this.store.dispatch(new RefreshPlayer());
  }

  private animateCoinFlip(resultOutcome: string): void {
    if (!this.coinElement) return;

    const coinEl = this.coinElement.nativeElement;

    // Resetear la moneda y mostrar solo heads inicialmente
    this.resetCoinAnimation();
    coinEl.setAttribute('data-show', 'heads'); // Mostrar solo heads durante la animación

    // Agregar clase de animación
    coinEl.classList.add('flipping');

    // Después de la animación, mostrar el resultado
    this.flipTimeout = setTimeout(() => {
      coinEl.classList.remove('flipping');

      // Mostrar el resultado final
      coinEl.setAttribute('data-show', resultOutcome);

      // Completar el flip
      this.handleFlipComplete();
    }, this.flipDuration);
  }

  private resetCoinAnimation(): void {
    if (!this.coinElement) return;

    const coinEl = this.coinElement.nativeElement;
    coinEl.classList.remove('flipping');
    coinEl.removeAttribute('data-result');
    coinEl.removeAttribute('data-show');
  }

  private handleFlipComplete(): void {
    this.isFlipping = false;

    if (!this.lastResult) return;

    const outcome = this.lastResult.outcome;
    const winAmount = this.lastResult.winAmount;
    const rewardItems = this.lastResult.rewardItems;

    // Mostrar mensaje de resultado
    if (this.selectedOutcome === outcome) {
      let message = `Congratulations! You won ${winAmount} uruks!`;

      if (outcome === 'goblin') {
        message = `🍀 GOBLIN! You won ${winAmount} uruks and bonus items!`;
      }

      this.toastr.success(message, 'Coin Flip Win!');

      // Mostrar recompensas adicionales si las hay
      if (rewardItems && rewardItems.length > 0) {
        const itemsText = rewardItems.map(item => `${item.quantity}x ${item.itemId}`).join(', ');
        this.toastr.info(`Bonus items received: ${itemsText}`, 'Bonus Rewards!');
      }
    } else {
      const outcomeText = this.getOutcomeDisplayName(outcome);
      const selectedText = this.getOutcomeDisplayName(this.selectedOutcome);
      this.toastr.warning(`The coin landed on ${outcomeText}. You bet on ${selectedText}.`, 'Coin Flip');
    }

    // Resetear selección
    this.selectedOutcome = null;
  }

  public selectOutcome(outcome: string): void {
    if (this.isFlipping) return;
    this.selectedOutcome = outcome;
  }

  public isOutcomeSelected(outcome: string): boolean {
    return this.selectedOutcome === outcome;
  }

  public getOutcomeDisplayName(outcome: string): string {
    const outcomeConfig = this.outcomes.find(o => o.outcome === outcome);
    return outcomeConfig?.label || outcome;
  }

  public getOutcomeColor(outcome: string): string {
    const outcomeConfig = this.outcomes.find(o => o.outcome === outcome);
    return outcomeConfig?.color || '#666';
  }

  // Método para formatear la fecha
  public formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // Método para formatear fechas en el leaderboard
  formatLeaderboardDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
