import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { FortuneWheelLeaderboard, FortuneWheelService, SpinHistory } from 'src/services/fortune-wheel.service';
import { ViewportService } from 'src/services/viewport.service';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';

interface WheelSegment {
  multiplier: number;
  color: string;
  label: string;
  image?: string;
}

@Component({
  selector: 'app-fortune-wheel',
  templateUrl: './fortune-wheel.component.html',
  styleUrls: ['./fortune-wheel.component.scss']
})
export class FortuneWheelComponent implements OnInit, AfterViewInit {
  @ViewChild('wheel') wheelCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('marker') marker: ElementRef;

  public prefix = ViewportService.getPreffixImg();
  public betAmount = new FormControl(10, [Validators.required, Validators.min(1), Validators.max(10000)]);
  public isSpinning = false;
  public lastResult: { multiplier: number, winAmount: number } | null = null;
  public playerBalance$ = this.store.select(MainState.getPlayer).pipe(map(player => player.uruks || 0));
  public selectedMultiplier: number | null = null;
  public spinHistory: SpinHistory[] = [];
  public isLoadingHistory = false;
  public leaderboard: FortuneWheelLeaderboard | null = null;
  public isLoadingLeaderboard = false;

  // Configuración de la ruleta con segmentos mezclados aleatoriamente
  private segments: WheelSegment[] = this.generateRandomizedSegments();

  private ctx: CanvasRenderingContext2D;
  private wheelRadius: number;
  private rotationAngle = 0;
  private spinningTime = 0;
  private spinDuration = 5000; // 5 segundos
  private targetAngle = 0;
  private animationId: number;
  private segmentAngles: { start: number, end: number, multiplier: number }[] = [];
  public Math = Math;

  private segmentImages: Map<number, HTMLImageElement> = new Map();

  // Añadir esta propiedad para el timeout de redimensionamiento
  private resizeTimeout: any;

  constructor(
    private toastr: ToastrService,
    private viewportService: ViewportService,
    private fortuneWheelService: FortuneWheelService,
    private store: Store,
    private websocket: WebSocketService
  ) {
    this.websocket.connect();
    this.listenForFOMOWheel();
  }

  ngOnDestroy(): void {
    this.websocket.socket.off('winStreakFortuneWheel');
  }

  private async listenForFOMOWheel() {
    const currentPlayer = await firstValueFrom(this.store.select(MainState.getPlayer));
    this.websocket.socket.on('winStreakFortuneWheel', (data: any) => {
      if (data.playerId != currentPlayer.id) this.showFomoToast(data.message);
    });
  }

  showFomoToast(message: string) {
    this.toastr.success(`🔥 ${message} 🔥`, 'Wow! ⏳', {
      timeOut: 4000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
      progressAnimation: 'increasing',
      tapToDismiss: false,
      newestOnTop: true,
    });
  }

  // Método para generar segmentos mezclados aleatoriamente
  private generateRandomizedSegments(): WheelSegment[] {
    // Configuración de colores para cada multiplicador
    const colorMap = {
      0: '#e74c3c',
      2: '#3498db',
      3: '#2ecc71',
      5: '#f39c12',
      10: '#9b59b6'
    };

    // Configuración de la ruleta (debe coincidir con el backend)
    const wheelConfig = [
      { multiplier: 0, probability: 0.25 },
      { multiplier: 2, probability: 0.30 },
      { multiplier: 3, probability: 0.25 },
      { multiplier: 5, probability: 0.12 },
      { multiplier: 10, probability: 0.08 }
    ];

    // Total de segmentos que queremos en la rueda
    const TOTAL_SEGMENTS = 20;

    // Crear los segmentos según las probabilidades
    const segmentsToCreate: WheelSegment[] = [];

    wheelConfig.forEach(config => {
      // Calcular cuántos segmentos necesitamos para esta probabilidad
      const segments = Math.round(TOTAL_SEGMENTS * config.probability);

      // Crear los segmentos para este multiplicador
      const newSegments = Array(segments).fill({
        multiplier: config.multiplier,
        color: colorMap[config.multiplier],
        label: config.multiplier === 0 ? 'LOSE' : `x${config.multiplier}`
      });

      segmentsToCreate.push(...newSegments);
    });

    // Ajustar el número total de segmentos si hay discrepancias por redondeo
    while (segmentsToCreate.length < TOTAL_SEGMENTS) {
      // Añadir segmentos del multiplicador más común (x2)
      segmentsToCreate.push({
        multiplier: 2,
        color: colorMap[2],
        label: 'x2'
      });
    }
    while (segmentsToCreate.length > TOTAL_SEGMENTS) {
      // Remover segmentos del multiplicador más común (x2)
      const index = segmentsToCreate.findIndex(s => s.multiplier === 2);
      if (index !== -1) {
        segmentsToCreate.splice(index, 1);
      }
    }

    // Mezclar los segmentos aleatoriamente (algoritmo de Fisher-Yates)
    for (let i = segmentsToCreate.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [segmentsToCreate[i], segmentsToCreate[j]] = [segmentsToCreate[j], segmentsToCreate[i]];
    }

    return segmentsToCreate;
  }

  ngOnInit(): void {
    this.calculateSegmentAngles();
    this.loadSpinHistory();
    this.loadLeaderboard();
    this.preloadImages();
  }

  ngAfterViewInit(): void {
    this.initCanvas();

    // Observar cambios en el tamaño del contenedor
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this.initCanvas();
      });

      const container = this.wheelCanvas.nativeElement.parentElement;
      resizeObserver.observe(container);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    // Usar setTimeout para evitar demasiadas actualizaciones durante el redimensionamiento
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.initCanvas();
    }, 100);
  }

  private loadSpinHistory(): void {
    this.isLoadingHistory = true;
    this.fortuneWheelService.getSpinHistory(10)
      .pipe(finalize(() => this.isLoadingHistory = false))
      .subscribe({
        next: (history) => {
          this.spinHistory = history;
        },
        error: (error) => {
          console.error('Error loading spin history:', error);
        }
      });
  }

  private loadLeaderboard(): void {
    this.isLoadingLeaderboard = true;
    this.fortuneWheelService.getLeaderboard().subscribe({
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

  private initCanvas(): void {
    const canvas = this.wheelCanvas.nativeElement;
    const container = canvas.parentElement;

    // Ajustar el tamaño del canvas al contenedor
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    this.ctx = canvas.getContext('2d');

    // Calcular el radio de la rueda basado en el tamaño del contenedor
    // y asegurarse de que sea responsive
    this.wheelRadius = Math.min(canvas.width, canvas.height) / 2 * 0.9; // 90% del radio máximo

    // Redibujar la rueda cuando cambia el tamaño
    this.drawWheel();
  }

  private calculateSegmentAngles(): void {
    const segmentAngle = (2 * Math.PI) / this.segments.length;
    this.segmentAngles = this.segments.map((segment, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      return {
        start: startAngle,
        end: endAngle,
        multiplier: segment.multiplier
      };
    });
  }

  private preloadImages(): void {
    // Precargar todas las imágenes de los segmentos
    this.segments.forEach(segment => {
      if (segment.image) {
        const img = new Image();
        img.src = segment.image;
        this.segmentImages.set(segment.multiplier, img);
      }
    });
  }

  private drawWheel(): void {
    if (!this.ctx) return;

    const canvas = this.wheelCanvas.nativeElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Limpiar el canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar los segmentos
    const segmentAngle = (2 * Math.PI) / this.segments.length;

    this.segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle + this.rotationAngle;
      const endAngle = (index + 1) * segmentAngle + this.rotationAngle;

      // Dibujar el segmento
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, this.wheelRadius, startAngle, endAngle);
      this.ctx.closePath();

      // Rellenar el segmento
      this.ctx.fillStyle = segment.color;
      this.ctx.fill();

      // Dibujar el borde
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Dibujar el texto del multiplicador o la imagen
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(startAngle + segmentAngle / 2);

      if (segment.image && this.segmentImages.has(segment.multiplier)) {
        // Si el segmento tiene una imagen y está precargada, la dibujamos
        const img = this.segmentImages.get(segment.multiplier);

        // Calcular el tamaño de la imagen basado en el tamaño de la rueda
        const imgSize = Math.max(24, Math.min(48, this.wheelRadius * 0.2));
        const imgOffset = imgSize / 2;

        // Posicionar la imagen proporcionalmente al tamaño de la rueda
        const imgPosition = this.wheelRadius * 0.7;

        // Dibujamos la imagen con tamaño adaptativo
        this.ctx.drawImage(img, imgPosition - imgOffset, -imgOffset, imgSize, imgSize);
      } else {
        // Si no hay imagen, solo dibujamos el texto
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#fff';

        // Ajustar el tamaño de la fuente según el tamaño de la rueda
        const fontSize = Math.max(12, Math.min(20, this.wheelRadius * 0.1));
        this.ctx.font = `bold ${fontSize}px Arial`;

        this.ctx.fillText(segment.label, this.wheelRadius * 0.85, 0);
      }

      this.ctx.restore();
    });

    // Dibujar el círculo central
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.wheelRadius * 0.15, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#333';
    this.ctx.fill();
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Dibujar líneas divisorias
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;

    for (let i = 0; i < this.segments.length; i++) {
      const angle = i * segmentAngle + this.rotationAngle;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(
        centerX + Math.cos(angle) * this.wheelRadius,
        centerY + Math.sin(angle) * this.wheelRadius
      );
      this.ctx.stroke();
    }
  }

  public async spinWheel(): Promise<void> {
    if (this.isSpinning || !this.betAmount.valid || !this.selectedMultiplier) return;

    const betAmount = this.betAmount.value;
    const playerBalance = await firstValueFrom(this.playerBalance$);
    if (betAmount > playerBalance) {
      this.toastr.error('Insufficient uruks for this bet');
      return;
    }

    this.isSpinning = true;

    this.fortuneWheelService.spin(betAmount, this.selectedMultiplier)
      .subscribe({
        next: (result) => {
          // Encontrar todos los segmentos con el multiplicador resultante
          const matchingSegments = this.segmentAngles.filter(
            segment => segment.multiplier === result.resultMultiplier
          );

          // Si no hay segmentos que coincidan, manejar el error
          if (matchingSegments.length === 0) {
            this.handleSpinError(`No matching segments found for multiplier ${result.resultMultiplier}`);
            return;
          }

          // Elegir aleatoriamente uno de los segmentos con ese multiplicador
          const targetSegment = matchingSegments[Math.floor(Math.random() * matchingSegments.length)];

          // Calcular un ángulo aleatorio dentro del segmento elegido
          const randomAngleWithinSegment = targetSegment.start +
            Math.random() * (targetSegment.end - targetSegment.start);

          // Calcular el ángulo final para que el marcador apunte al segmento correcto
          // Necesitamos invertir el ángulo porque la rueda gira en sentido contrario al marcador
          const markerPosition = Math.PI * 1.5; // El marcador está en la parte superior (270 grados)
          this.targetAngle = (markerPosition - randomAngleWithinSegment) % (2 * Math.PI);

          // Añadir rotaciones completas para que gire varias veces antes de detenerse
          this.targetAngle += Math.PI * 4; // 2 vueltas completas + ángulo objetivo

          // Iniciar la animación
          this.spinningTime = 0;
          this.animateWheel();

          // Guardar el resultado para mostrarlo después
          this.lastResult = {
            multiplier: result.resultMultiplier,
            winAmount: result.winAmount
          };

          this.store.dispatch(new RefreshPlayer());
          // Recargar el historial
          this.loadSpinHistory();
        },
        error: (error) => {
          this.handleSpinError(error.error?.message || 'Error spinning the wheel');
        }
      });
  }

  private handleSpinError(message: string): void {
    this.isSpinning = false;
    this.toastr.error(message);
    console.error('Spin error:', message);
    this.store.dispatch(new RefreshPlayer());
  }

  private animateWheel(): void {
    const now = Date.now();
    if (!this.spinningTime) this.spinningTime = now;

    const elapsed = now - this.spinningTime;
    const progress = Math.min(elapsed / this.spinDuration, 1);

    // Función de easing para desaceleración
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    // Calcular el ángulo actual basado en el progreso
    this.rotationAngle = easeOut(progress) * this.targetAngle;

    // Redibujar la rueda
    this.drawWheel();

    if (progress < 1) {
      // Continuar la animación
      this.animationId = requestAnimationFrame(() => this.animateWheel());
    } else {
      // Animación completa
      this.handleSpinComplete();
    }
  }

  private handleSpinComplete(): void {
    this.isSpinning = false;

    if (!this.lastResult) return;

    const multiplier = this.lastResult.multiplier;
    const winAmount = this.lastResult.winAmount;

    // Mostrar mensaje de resultado
    if (multiplier === 0) {
      this.toastr.error(`The wheel landed on LOSE! You lost ${Math.abs(winAmount)} uruks.`, 'Wheel of Fortune');
    } else if (this.selectedMultiplier === multiplier) {
      this.toastr.success(`Congratulations! You won ${winAmount} uruks!`, 'Wheel of Fortune');
    } else {
      const multiplierText = multiplier === 0 ? 'LOSE' : `x${multiplier}`;
      const selectedText = this.selectedMultiplier === 0 ? 'LOSE' : `x${this.selectedMultiplier}`;
      this.toastr.warning(`The wheel landed on ${multiplierText}. You bet on ${selectedText}.`, 'Wheel of Fortune');
    }

    // Resetear selección
    this.selectedMultiplier = null;
  }

  public selectMultiplier(multiplier: number): void {
    if (this.isSpinning) return;
    this.selectedMultiplier = multiplier;
  }

  public isMultiplierSelected(multiplier: number): boolean {
    return this.selectedMultiplier === multiplier;
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
