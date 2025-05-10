import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PlayerModel } from '../../modules/core/models/player.model';
import { ItemBoxComponent } from '../item-box/item-box.component';

interface PlayerDeed {
  deedId: number;
  currentTierIndex: number;
}

interface Deed {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface PlayerDeedsResponse {
  allDeeds: Deed[];
  playerDeeds: PlayerDeed[];
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
          [height]="50"
          [width]="50"
          [image]="deed.image"
          [ngClass]="{
            inactive: !getPlayerDeed(deed.id, playerDeeds.playerDeeds)
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
    }

    .inactive {
      opacity: 0.5;
      filter: grayscale(1);
    }

    .content-tooltip {
      background: rgba(0, 0, 0, 0.9);
      border-radius: 4px;
      max-width: 300px;
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

  getPlayerDeed(deedId: number, playerDeeds: PlayerDeed[]): PlayerDeed | undefined {
    return playerDeeds?.find((deed) => deed.deedId === deedId);
  }

  filteredDeeds(playerDeeds: PlayerDeedsResponse): Deed[] {
    return playerDeeds.allDeeds.filter(deed => {
      const isUnlocked = !!this.getPlayerDeed(deed.id, playerDeeds.playerDeeds);
      const matchesSearch = deed.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
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
    // Trigger change detection
  }
}
