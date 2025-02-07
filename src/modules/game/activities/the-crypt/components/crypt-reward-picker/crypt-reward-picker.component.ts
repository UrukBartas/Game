import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CryptService } from 'src/services/crypt.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-crypt-reward-picker',
  templateUrl: './crypt-reward-picker.component.html',
  styleUrl: './crypt-reward-picker.component.scss',
})
export class CryptRewardPickerComponent {
  crypt = inject(CryptService);
  possibleRewards$ = this.crypt.getRewards();
  public prefix = ViewportService.getPreffixImg();
  @Output() rewardChosen = new EventEmitter<any>();

  pickReward(reward: any) {
    this.rewardChosen.emit(reward);
  }
}
