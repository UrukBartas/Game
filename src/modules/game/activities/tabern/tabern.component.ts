import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { BoardMission, BoardMissionService, PlayerBoardMission } from 'src/services/board-mission.service';
import { ViewportService } from 'src/services/viewport.service';
import { RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-tabern',
  templateUrl: './tabern.component.html',
  styleUrl: './tabern.component.scss'
})
export class TabernComponent extends TemplatePage implements OnInit {
  missions: BoardMission[] = [];
  playerMissions: PlayerBoardMission[] = [];
  selectedFilter: 'ALL' | 'HUNT' | 'GATHER' = 'ALL';
  loading = false;
  activeMission: PlayerBoardMission = null;
  store = inject(Store)
  prefix = ViewportService.getPreffixImg();
  selectedGame: string | null = null;
  currentTavernSection: 'missions' | 'games' | 'shop' = 'missions';

  constructor(
    private boardMissionService: BoardMissionService
  ) {
    super();
  }

  getUrukIcons(rewardLevel: number): number[] {
    // Convertir 2->1, 3->2, 4->3 iconos
    return Array(rewardLevel - 1).fill(0);
  }

  ngOnInit() {
    this.refreshMissions();
  }

  private loadMissions() {
    this.loading = true;
    this.boardMissionService.getActiveMissions().subscribe({
      next: (missions) => {
        this.missions = missions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading missions:', error);
        this.loading = false;
      }
    });
  }

  private loadPlayerMissions() {
    this.boardMissionService.getPlayerMissions().subscribe({
      next: (missions) => {
        this.playerMissions = missions;
        this.activeMission = missions.find(mission => mission.status === 'IN_PROGRESS');
      },
      error: (error) => {
        console.error('Error loading player missions:', error);
      }
    });
  }

  filterMissions(type: 'ALL' | 'HUNT' | 'GATHER') {
    this.selectedFilter = type;
  }

  getFilteredMissions(): BoardMission[] {
    if (this.selectedFilter === 'ALL') return this.missions;
    return this.missions.filter(mission => mission.type === this.selectedFilter);
  }

  refreshMissions() {
    this.loadMissions();
    this.loadPlayerMissions();
    this.store.dispatch(new RefreshPlayer())
  }

  async acceptMission(mission: BoardMission) {
    try {
      const playerMission = await this.boardMissionService
        .acceptMission(mission.id)
        .toPromise();
      this.playerMissions.push(playerMission);
      this.refreshMissions();
    } catch (error) {
      console.error('Error accepting mission:', error);
      // Opcional: Mostrar mensaje de error
    }
  }

  isMissionAccepted(mission: BoardMission): boolean {
    return this.playerMissions.some(pm => pm.missionId === mission.id);
  }

  getDifficultyClass(difficulty: string): string {
    const difficultyMap = {
      'EASY': 'easy',
      'MEDIUM': 'medium',
      'HARD': 'hard'
    };
    return difficultyMap[difficulty] || '';
  }

  canAcceptMission(mission: BoardMission): boolean {
    return !this.activeMission && !this.isMissionAccepted(mission);
  }

  getButtonText(mission: BoardMission): string {
    if (this.isMissionAccepted(mission)) {
      return 'Accepted';
    }
    if (this.activeMission) {
      return 'Complete Active Mission First';
    }
    return 'Accept Mission';
  }

  switchTavernSection(section: 'missions' | 'games' | 'shop'): void {
    this.currentTavernSection = section;
    this.selectedGame = null; // Reset selected game when switching sections

    if (section === 'missions') {
      this.refreshMissions();
    }
  }

  selectGame(game: string): void {
    this.selectedGame = game;
  }

  closeGame(): void {
    this.selectedGame = null;
  }
}
