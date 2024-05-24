import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { getAccount } from '@wagmi/core';
import { debounceTime, map, tap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Rarity } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getRarityColor, truncateEthereumAddress } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';

@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrl: './leadeboard.component.scss',
})
export class LeadeboardComponent extends TemplatePage {
  questTiers = [
    { maxQuests: 10, title: 'Snaga', glow: 'common', rarity: Rarity.COMMON },
    {
      maxQuests: 50,
      title: 'Warchanter',
      glow: 'common',
      rarity: Rarity.COMMON,
    },
    {
      maxQuests: 100,
      title: 'Brute',
      glow: 'uncommon',
      rarity: Rarity.UNCOMMON,
    },
    {
      maxQuests: 500,
      title: 'Marauder',
      glow: 'uncommon',
      rarity: Rarity.UNCOMMON,
    },
    { maxQuests: 1000, title: 'Warlord', glow: 'epic', rarity: Rarity.EPIC },
    { maxQuests: 2000, title: 'Chieftain', glow: 'epic', rarity: Rarity.EPIC },
    {
      maxQuests: 5000,
      title: 'Overlord',
      glow: 'legendary',
      rarity: Rarity.LEGENDARY,
    },
    {
      maxQuests: 10000,
      title: 'Warbringer',
      glow: 'mythic',
      rarity: Rarity.MYTHIC,
    },
    {
      maxQuests: Infinity,
      title: 'Godslayer',
      glow: 'highlight',
      rarity: Rarity.MYTHIC,
    },
  ];
  getRarityColor = getRarityColor;
  public getTitleForQuestsCompleted(questsCompleted: number): {
    title: string;
    glow: string;
    rarity: Rarity;
  } {
    for (const tier of this.questTiers) {
      if (questsCompleted <= tier.maxQuests) {
        return tier;
      }
    }
    return { title: 'Unknown', glow: 'common', rarity: Rarity.COMMON };
  }

  playerService = inject(PlayerService);
  fb = inject(FormBuilder);
  public sortBy = signal<string>('level');
  public sortType = signal<'asc' | 'desc'>('desc');
  public activePage = signal<number>(0);
  public chunkSize = signal<number>(25);
  public from = signal<Date>(new Date(0));
  public to = signal<Date>(new Date());
  public nameOrWallet = signal('');
  public lastPageSize = 0;
  public getLeaderboard$ = computed(() => {
    return this.playerService
      .getLeaderboard(
        this.sortBy(),
        this.sortType(),
        this.activePage(),
        this.chunkSize(),
        this.nameOrWallet(),
        this.from(),
        this.to()
      )
      .pipe(
        map((players) => {
          return players.map((player) => {
            const playerCasted = player as PlayerModel & { _count: any };
            const questsCompleted = playerCasted._count.quest;
            const title = this.getTitleForQuestsCompleted(questsCompleted);
            return {
              ...player,
              pve: {
                ...title,
              },
            };
          });
        }),
        tap((entry) => (this.lastPageSize = entry.length))
      );
  });
  public formGroup = this.fb.group({
    userOrWallet: ['', []],
  });

  public filterAllTime() {
    this.from.set(new Date(0));
    this.to.set(new Date());
  }

  public filterByMonth() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.from.set(startOfMonth);
    this.to.set(endOfMonth);
  }

  public filterCurrentWeek() {
    const now = new Date();

    const dayOfWeek = now.getDay();
    const dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    this.from.set(startOfWeek);
    this.to.set(endOfWeek);
  }

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
