import { Component, inject, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Debounce } from 'lodash-decorators';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, map, shareReplay, switchMap, tap } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { PlayerService } from 'src/services/player.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
@Component({
  selector: 'app-generic-stats',
  templateUrl: './generic-stats.component.html',
  styleUrl: './generic-stats.component.scss',
})
export class GenericStatsComponent {
  @Input() cappedStats: any;
  @Input() simplified = false;
  @Input() player!: PlayerModel;
  playerService = inject(PlayerService);
  toastService = inject(ToastrService);
  store = inject(Store);
  allowedStatsToUpgrade = [
    'health',
    'armor',
    'energy',
    'damage',
    'speed',
    'block',
    'penetration',
    'crit',
    'accuracy',
    'dodge',
  ];
  allStatsUpgradeStatus$ = this.getUpgradeStatus();
  public player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));
  private getUpgradeStatus() {
    return this.playerService.getUpgradeCost().pipe(shareReplay(1));
  }
  public statItems = [
    {
      label: 'Life',
      key: 'health',
      tooltip: 'Total health points of the character',
    },
    {
      label: 'Armor',
      key: 'armor',
      tooltip:
        'Reduce incoming damage, reduction is correlated to health (max 50%)',
    },
    {
      label: 'Energy',
      key: 'energy',
      tooltip: 'Consumed when attacking (40), lack of it reduces damage dealt',
    },
    { label: 'Damage', key: 'damage', tooltip: 'Base damage points' },
    {
      label: 'Speed',
      key: 'speed',
      tooltip: 'In a tie context, will decide the winner',
    },
    {
      label: 'PN',
      key: 'penetration',
      tooltip:
        'Reduce in a percent the armor of the opponent (deal more damage)',
      suffix: '%',
    },
    {
      label: 'Crit',
      key: 'crit',
      tooltip: 'Chance of doubling the final calculated damage',
      suffix: '%',
    },
    {
      label: 'Dodge',
      key: 'dodge',
      tooltip: 'Chance of making an opponent miss an attack',
      suffix: '%',
    },
    {
      label: 'Block',
      key: 'block',
      tooltip: 'Chance of blocking an opponent attack',
      suffix: '%',
    },
    {
      label: 'Acc',
      key: 'accuracy',
      tooltip: 'Accuracy, Reduces the chance of missing an attack',
      suffix: '%',
    },
  ];
  @Debounce(200)
  public upgradeStat(stat: string) {
    firstValueFrom(
      this.playerService.upgradeStat(stat).pipe(
        tap((e) => this.toastService.success('Stat upgraded successfully!')),
        switchMap((e) => {
          this.allStatsUpgradeStatus$ = this.getUpgradeStatus();
          return this.store.dispatch(new RefreshPlayer());
        })
      )
    );
  }
}
