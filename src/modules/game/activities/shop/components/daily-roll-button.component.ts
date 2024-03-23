import {
  Component,
  EventEmitter,
  inject,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import { interval, Subscription, take } from 'rxjs';
import { ShopService } from 'src/services/shop.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-daily-roll-button',
  templateUrl: './daily-roll-button.component.html',
  styleUrl: './daily-roll-button.component.scss',
})
export class DailyRollButtonComponent implements OnDestroy {
  @Output() buttonClicked = new EventEmitter();
  viewportService = inject(ViewportService);
  ngZone = inject(NgZone);
  shopService = inject(ShopService);
  showButton = false;
  timerSubscription: Subscription;
  dailyRollButtonStatus = {
    enabled: false,
    timer: '24:00H',
  };

  constructor() {
    this.setDailyRollButtonStatus();
  }

  doDailyRoll() {
    this.updateTimer(86400);
    this.buttonClicked.emit();
  }

  setDailyRollButtonStatus() {
    this.shopService
      .getDailyRollData()
      .pipe(take(1))
      .subscribe(({date}) => {
        this.showButton = true;
        const currentTime = new Date();
        if (date) {
          const lastRollDate = new Date(date);
          const timeDiff = currentTime.getTime() - lastRollDate.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            const remainingTimeSeconds = Math.floor(
              24 * 3600 - timeDiff / 1000
            );
            this.updateTimer(remainingTimeSeconds);
          } else {
            this.dailyRollButtonStatus = {
              enabled: true,
              timer: null,
            };
          }
        } else {
          this.dailyRollButtonStatus = {
            enabled: true,
            timer: null,
          };
        }
      });
  }

  private updateTimer(remainingTimeSeconds: number) {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.ngZone.runOutsideAngular(() => {
      this.timerSubscription = interval(1000).subscribe((x) => {
        this.ngZone.run(() => {
          if (remainingTimeSeconds > 0) {
            remainingTimeSeconds--;
            const hours = Math.floor(remainingTimeSeconds / 3600);
            const minutes = Math.floor((remainingTimeSeconds % 3600) / 60);
            const seconds = remainingTimeSeconds % 60;
            const padZero = (number: number) =>
              number < 10 ? `0${number}` : number.toString();
            this.dailyRollButtonStatus.timer = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
            this.dailyRollButtonStatus.enabled = false;
          } else {
            this.timerSubscription.unsubscribe();
            this.dailyRollButtonStatus = {
              enabled: true,
              timer: null,
            };
          }
        });
      });
    });
  }

  getButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 'btn-lg';
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 'btn-md';
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
