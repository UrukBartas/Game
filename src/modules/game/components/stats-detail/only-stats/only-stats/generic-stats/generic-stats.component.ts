import { Component, inject, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Debounce } from 'lodash-decorators';
import { ToastrService } from 'ngx-toastr';
import {
  firstValueFrom,
  map,
  shareReplay,
  switchMap,
  tap
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { PlayerService } from 'src/services/player.service';
import {
  getPercentage
} from 'src/standalone/item-tooltip/item-tooltip.component';
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
  @Input() hoveredItemStats: any = null;
  playerService = inject(PlayerService);
  toastService = inject(ToastrService);
  store = inject(Store);

  public prefix = environment.permaLinkImgPref;
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
  public player$ = this.store.select(MainState.getState).pipe(
    map((entry) => {
      return entry.player;
    })
  );

  public getPercentage(key: string) {
    return getPercentage(key);
  }
  private getUpgradeStatus() {
    return this.playerService.getUpgradeCost().pipe(shareReplay(1));
  }
  public statItems = [
    {
      label: 'Life',
      key: 'health',
      tooltip: 'Total health points of the character',
      icon: '/assets/icons/health-normal.png',
    },
    {
      label: 'Armor',
      key: 'armor',
      tooltip:
        'Reduce incoming damage, reduction is correlated to health (max 50%)',
      icon: '/assets/icons/armor-vest.png',
    },
    {
      label: 'Energy',
      key: 'energy',
      tooltip: 'Consumed when attacking (40), lack of it reduces damage dealt',
      icon: '/assets/icons/embrassed-energy.png',
    },
    {
      label: 'Damage',
      key: 'damage',
      tooltip: 'Base damage points',
      icon: '/assets/icons/biceps.png',
    },
    {
      label: 'Speed',
      key: 'speed',
      tooltip: 'In a tie context, will decide the winner',
      icon: '/assets/icons/sprint.png',
    },
    {
      label: 'PN',
      icon: '/assets/icons/cracked-shield.png',
      key: 'penetration',
      tooltip:
        'Reduce in a percent the armor of the opponent (deal more damage)',
      suffix: '%',
    },
    {
      label: 'Crit',
      key: 'crit',
      icon: '/assets/icons/explosion-rays.png',
      tooltip: 'Chance of doubling the final calculated damage',
      suffix: '%',
    },
    {
      label: 'Dodge',
      key: 'dodge',
      icon: '/assets/icons/dodging.png',
      tooltip: 'Chance of making an opponent miss an attack',
      suffix: '%',
    },
    {
      label: 'Block',
      key: 'block',
      icon: '/assets/icons/shield-bounces.png',
      tooltip: 'Chance of blocking an opponent attack',
      suffix: '%',
    },
    {
      label: 'Acc',
      key: 'accuracy',
      icon: '/assets/icons/bullseye.png',
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
