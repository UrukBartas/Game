import { Component, inject, Input } from '@angular/core';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-crypt-player-state',
  templateUrl: './crypt-player-state.component.html',
  styleUrl: './crypt-player-state.component.scss',
})
export class CryptPlayerStateComponent {
  private viewportService = inject(ViewportService);
  @Input() currentState: PlayerModel;
  @Input() hideTitle = false;
  @Input() appliedBonuses: Array<any> = [];
  public getPlayerImageSize() {
    if (
      this.viewportService.screenSize === 'xs' ||
      this.viewportService.screenSize === 'sm' ||
      this.viewportService.screenSize === 'md'
    ) {
      return 120;
    }
    return 180;
  }
  getHealthBarHeight() {
    switch (this.viewportService.screenWidth) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 30;
      case 'md':
        return 20;
      case 'xs':
      case 'sm':
      default:
        return 20;
    }
  }
}
