import { Component, inject, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Debounce } from 'lodash-decorators';
import { ToastrService } from 'ngx-toastr';
import { filter, firstValueFrom, map, shareReplay, switchMap, tap } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getPercentage, getStatIconClass, getStatValueClass, getValueStatusClass } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-generic-stats',
  templateUrl: './generic-stats.component.html',
  styleUrl: './generic-stats.component.scss',
})
export class GenericStatsComponent {
  @Input() cappedStats: any;
  @Input() player!: PlayerModel;
  @Input() hoveredItemStats: any = null;
  @Input() allowUpgrade = false;
  playerService = inject(PlayerService);
  toastService = inject(ToastrService);
  store = inject(Store);

  public currentPlayer$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry?.player)
  );

  public prefix = ViewportService.getPreffixImg();
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

  // Usar los métodos de utils.ts
  public getPercentage = getPercentage;
  public getStatIconClass = getStatIconClass;
  public getStatValueClass = getStatValueClass;
  public getValueStatusClass = getValueStatusClass;

  private getUpgradeStatus() {
    return this.playerService.getUpgradeCost().pipe(shareReplay(1));
  }

  public statItems = [
    {
      label: 'Life',
      key: 'health',
      tooltip: 'Health: Total health points of the character',
      icon: '/assets/icons/health-normal.png',
    },
    {
      label: 'Armor',
      key: 'armor',
      tooltip:
        'Armor: Reduce incoming damage, reduction is correlated to health (max 50%)',
      icon: '/assets/icons/armor-vest.png',
    },
    {
      label: 'Energy',
      key: 'energy',
      tooltip: 'Energy: Consumed when attacking (40), lack of it reduces damage dealt',
      icon: '/assets/icons/embrassed-energy.png',
    },
    {
      label: 'Damage',
      key: 'damage',
      tooltip: 'Damage: Base damage points',
      icon: '/assets/icons/biceps.png',
    },
    {
      label: 'Speed',
      key: 'speed',
      tooltip: 'Speed: In a tie context, will decide the winner',
      icon: '/assets/icons/sprint.png',
    },
    {
      label: 'PN',
      icon: '/assets/icons/cracked-shield.png',
      key: 'penetration',
      tooltip:
        'Penetration: Reduce in a percent the armor of the opponent (deal more damage)',
      suffix: '%',
    },
    {
      label: 'Crit',
      key: 'crit',
      icon: '/assets/icons/explosion-rays.png',
      tooltip: 'Crit: Chance of doubling the final calculated damage',
      suffix: '%',
    },
    {
      label: 'Dodge',
      key: 'dodge',
      icon: '/assets/icons/dodging.png',
      tooltip: 'Dodge: Chance of making an opponent miss an attack',
      suffix: '%',
    },
    {
      label: 'Block',
      key: 'block',
      icon: '/assets/icons/shield-bounces.png',
      tooltip: 'Block: Chance of blocking an opponent attack',
      suffix: '%',
    },
    {
      label: 'Acc',
      key: 'accuracy',
      icon: '/assets/icons/bullseye.png',
      tooltip: 'Accuracy: Reduces the chance of missing an attack',
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
