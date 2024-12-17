import { Component, EventEmitter, inject, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CryptService } from 'src/services/crypt.service';

@Component({
  selector: 'app-crypt-reward-picker',
  templateUrl: './crypt-reward-picker.component.html',
  styleUrl: './crypt-reward-picker.component.scss',
})
export class CryptRewardPickerComponent {
  crypt = inject(CryptService);
  possibleRewards$ = this.crypt.getRewards();
  public prefix = environment.permaLinkImgPref;
  @Output() rewardChosen = new EventEmitter<any>();

  pickReward(reward: any) {
    this.rewardChosen.emit(reward);
  }
}
