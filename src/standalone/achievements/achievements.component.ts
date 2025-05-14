import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Deed, DeedData, DeedId, PlayerModel } from '../../modules/core/models/player.model';
import { ItemBoxComponent } from '../item-box/item-box.component';

interface PlayerDeedsResponse {
  allDeeds: DeedData[];
  playerDeeds: any[];
}

type FilterType = 'all' | 'unlocked' | 'locked';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, ItemBoxComponent, FormsModule],
  template: `
    <div class="achievements-container">
      <div class="search-filter-container">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input
            type="text"
            [(ngModel)]="searchText"
            (ngModelChange)="onSearchChange()"
            placeholder="Search achievements..."
            class="form-control"
          >
        </div>
        <div class="filter-buttons">
          <button
            *ngFor="let filter of filters"
            class="btn"
            [class.btn-primary]="currentFilter === filter.value"
            [class.btn-outline-primary]="currentFilter !== filter.value"
            (click)="setFilter(filter.value)"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div class="list-deeds" *ngIf="playerDeeds$ | async as playerDeeds">
        <app-item-box
          *ngFor="let deed of filteredDeeds(playerDeeds)"
          [height]="64"
          [width]="64"
          image="{{ deed.image }}"
          [ngClass]="{
            inactive: !getPlayerDeed(deed.id, playerDeeds.playerDeeds),
            'achievement-unlocked': getPlayerDeed(deed.id, playerDeeds.playerDeeds)
          }"
        >
          <ng-container tooltip>
            <div class="content-tooltip p-3 py-2">
              <div class="description w-100 flex-column">
                <p class="h6 m-0 text-light" style="font-size: 13px">
                  {{ deed.name }}
                </p>
                <p class="m-0">{{ deed.description }}</p>
                <ng-container
                  *ngIf="getPlayerDeed(deed.id, playerDeeds.playerDeeds) as playerDeed"
                >
                  <p class="m-0 text-light" style="font-size: 13px">
                    Current tier level {{ playerDeed.currentTierIndex + 1 }}
                  </p>
                  <p class="m-0 text-light" style="font-size: 13px">
                    All base stats +{{ playerDeed.currentTierIndex }}
                  </p>
                </ng-container>
              </div>
            </div>
          </ng-container>
        </app-item-box>
      </div>
    </div>
  `,
  styles: [`
    .achievements-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 10px;
      width: 100%;
    }

    .search-filter-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .search-box {
      position: relative;
      width: 100%;

      i {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
      }

      input {
        padding-left: 35px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;

        &:focus {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: none;
          color: white;
        }

        &::placeholder {
          color: #666;
        }
      }
    }

    .filter-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .btn {
        flex: 1;
        min-width: 100px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;

        &:hover {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        &.btn-primary {
          background: var(--primary);
          border-color: var(--primary);
        }
      }
    }

    .list-deeds {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }

    .inactive {
      opacity: 0.5;
      filter: grayscale(1);
      transition: all 0.3s ease;
    }

    .achievement-unlocked {
      opacity: 1;
      filter: none;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .content-tooltip {
      background: rgba(0, 0, 0, 0.9);
      border-radius: 4px;
      max-width: 300px;
      color: white;
    }

    :host ::ng-deep app-item-box {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  `]
})
export class AchievementsComponent {
  @Input() player: PlayerModel;
  @Input() playerDeeds$: Observable<PlayerDeedsResponse>;

  searchText: string = '';
  currentFilter: FilterType = 'all';

  filters = [
    { label: 'All', value: 'all' as FilterType },
    { label: 'Unlocked', value: 'unlocked' as FilterType },
    { label: 'Locked', value: 'locked' as FilterType }
  ];

  public getPlayerDeed(deedId: DeedId, deedsPlayer: Array<Deed>) {
    return deedsPlayer.find((entry) => entry.deedDataId == deedId) as Deed & {
      currentTierIndex: number;
    };
  }

  filteredDeeds(playerDeeds: PlayerDeedsResponse): DeedData[] {
    if (!playerDeeds?.allDeeds) return [];

    return playerDeeds.allDeeds.filter(deed => {
      const isUnlocked = !!this.getPlayerDeed(deed.id, playerDeeds.playerDeeds);
      const matchesSearch = !this.searchText ||
        deed.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        deed.description.toLowerCase().includes(this.searchText.toLowerCase());

      switch (this.currentFilter) {
        case 'unlocked':
          return isUnlocked && matchesSearch;
        case 'locked':
          return !isUnlocked && matchesSearch;
        default:
          return matchesSearch;
      }
    });
  }

  setFilter(filter: FilterType) {
    this.currentFilter = filter;
  }

  onSearchChange() {
    // La detección de cambios se maneja automáticamente por ngModel
  }
}
