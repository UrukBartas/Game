import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { FortuneWheelService, SpinHistory } from 'src/services/fortune-wheel.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';

interface WheelSegment {
  multiplier: number;
  probability: number;
  color: string;
  label: string;
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
  public betAmount = new FormControl(10, [Validators.required, Validators.min(1), Validators.max(9999999)]);
  public isSpinning = false;
  public lastResult: { multiplier: number, winAmount: number } | null = null;
  public playerBalance = 0;
  public selectedMultiplier: number | null = null;
  public spinHistory: SpinHistory[] = [];
  public isLoadingHistory = false;

  // Configuración de la ruleta (debe coincidir con el backend)
  private segments: WheelSegment[] = [
    { multiplier: 0, probability: 0.25, color: '#e74c3c', label: 'x0' },
    { multiplier: 2, probability: 0.35, color: '#3498db', label: 'x2' },
    { multiplier: 3, probability: 0.25, color: '#2ecc71', label: 'x3' },
    { multiplier: 5, probability: 0.10, color: '#f39c12', label: 'x5' },
    { multiplier: 10, probability: 0.05, color: '#9b59b6', label: 'x10' }
  ];

  private ctx: CanvasRenderingContext2D;
  private wheelRadius: number;
  private rotationAngle = 0;
  private spinningTime = 0;
  private spinDuration = 5000; // 5 segundos
  private targetAngle = 0;
  private animationId: number;
  private segmentAngles: { start: number, end: number, multiplier: number }[] = [];
  public Math = Math;
  constructor(
    private toastr: ToastrService,
    private viewportService: ViewportService,
    private fortuneWheelService: FortuneWheelService,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.calculateSegmentAngles();
    this.loadPlayerBalance();
    this.loadSpinHistory();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.drawWheel();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.initCanvas();
    this.drawWheel();
  }

  private loadPlayerBalance(): void {
    const player = this.store.selectSnapshot(MainState.getPlayer);
    if (player) {
      this.playerBalance = player.uruks || 0;
    }
  }

  private loadSpinHistory(): void {
    this.isLoadingHistory = true;
    this.fortuneWheelService.getSpinHistory(5)
      .pipe(finalize(() => this.isLoadingHistory = false))
      .subscribe({
        next: (history) => {
          this.spinHistory = history;
        },
        error: (error) => {
          console.error('Error loading spin history:', error);
          this.toastr.error('Could not load spin history');
        }
      });
  }

  private initCanvas(): void {
    const canvas = this.wheelCanvas.nativeElement;
    const container = canvas.parentElement;

    // Hacer el canvas responsive
    const size = Math.min(container.clientWidth, 400);
    canvas.width = size;
    canvas.height = size;

    this.ctx = canvas.getContext('2d');
    this.wheelRadius = size / 2;

    // Centrar el canvas
    this.ctx.translate(this.wheelRadius, this.wheelRadius);
  }

  private calculateSegmentAngles(): void {
    this.segmentAngles = [];
    let startAngle = 0;

    // Convertir probabilidades en ángulos
    for (const segment of this.segments) {
      const angle = segment.probability * 2 * Math.PI;
      this.segmentAngles.push({
        start: startAngle,
        end: startAngle + angle,
        multiplier: segment.multiplier
      });
      startAngle += angle;
    }
  }

  private drawWheel(): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.clearRect(-this.wheelRadius, -this.wheelRadius, this.wheelRadius * 2, this.wheelRadius * 2);

    // Rotar el canvas según el ángulo actual
    this.ctx.rotate(this.rotationAngle);

    // Dibujar segmentos
    let startAngle = 0;
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const angle = segment.probability * 2 * Math.PI;

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, this.wheelRadius - 10, startAngle, startAngle + angle);
      this.ctx.closePath();

      // Rellenar segmento
      this.ctx.fillStyle = segment.color;
      this.ctx.fill();

      // Dibujar borde
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Dibujar texto
      this.ctx.save();
      this.ctx.rotate(startAngle + angle / 2);
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillText(segment.label, this.wheelRadius * 0.75, 0);
      this.ctx.restore();

      startAngle += angle;
    }

    // Dibujar círculo central
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.wheelRadius * 0.15, 0, Math.PI * 2);
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.restore();
  }

  public spinWheel(): void {
    if (this.isSpinning || !this.selectedMultiplier) return;

    const betValue = this.betAmount.value || 0;

    if (betValue <= 0) {
      this.toastr.error('Please enter a valid bet amount');
      return;
    }

    if (betValue > this.playerBalance) {
      this.toastr.error('Not enough uruks for this bet');
      return;
    }

    this.isSpinning = true;
    this.lastResult = null;

    // Llamar al servicio para realizar el giro
    this.fortuneWheelService.spin(betValue, this.selectedMultiplier)
      .subscribe({
        next: (result) => {
          // Actualizar el balance del jugador
          this.playerBalance = result.newBalance;

          // Determinar el ángulo objetivo para que el marcador apunte al resultado
          const targetSegment = this.segmentAngles.find(s => s.multiplier === result.resultMultiplier);
          if (!targetSegment) {
            this.handleSpinError('Invalid result from server');
            return;
          }

          // Calcular un ángulo aleatorio dentro del segmento ganador
          const randomAngleWithinSegment = targetSegment.start + (Math.random() * (targetSegment.end - targetSegment.start));

          // Añadir rotaciones completas (2π) para que gire varias veces antes de detenerse
          this.targetAngle = randomAngleWithinSegment + (Math.PI * 4); // 2 vueltas completas + ángulo objetivo

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
      this.toastr.error(`Bad luck! You lost ${Math.abs(winAmount)} uruks.`, 'Wheel of Fortune');
    } else if (this.selectedMultiplier === multiplier) {
      this.toastr.success(`Congratulations! You won ${winAmount} uruks!`, 'Wheel of Fortune');
    } else {
      this.toastr.warning(`The wheel landed on x${multiplier}. You bet on x${this.selectedMultiplier}.`, 'Wheel of Fortune');
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
}
