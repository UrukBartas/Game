import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { getAccount } from '@wagmi/core';
import { debounceTime, map, tap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { truncateEthereumAddress } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';

@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrl: './leadeboard.component.scss',
})
export class LeadeboardComponent extends TemplatePage {
  playerService = inject(PlayerService);
  fb = inject(FormBuilder);
  public sortBy = signal<string>('level');
  public sortType = signal<'asc' | 'desc'>('desc');
  public activePage = signal<number>(0);
  public chunkSize = signal<number>(25);
  public nameOrWallet = signal('');
  public lastPageSize = 0;
  public getLeaderboard$ = computed(() => {
    return this.playerService
      .getLeaderboard(
        this.sortBy(),
        this.sortType(),
        this.activePage(),
        this.chunkSize(),
        this.nameOrWallet()
      )
      .pipe(tap((entry) => (this.lastPageSize = entry.length)));
  });
  public formGroup = this.fb.group({
    userOrWallet: ['', []],
  });

  public truncateAddress = truncateEthereumAddress;
  public actualAddress = getAccount().address;

  public getImgBasedOnRanking(number: number) {
    switch (number) {
      case 0:
        return 'assets/leaderboard/gold.png';
      case 1:
        return 'assets/leaderboard/silver.png';
      default:
        return 'assets/leaderboard/third.png';
    }
  }

  public nextPage() {
    this.activePage.set(this.activePage() + 1);
  }

  public prevPage() {
    this.activePage.set(this.activePage() - 1);
  }

  constructor() {
    super();
    this.formGroup
      .get('userOrWallet')
      .valueChanges.pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((data) => this.nameOrWallet.set(data));
  }
}
