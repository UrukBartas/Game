import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { BoardMission, BoardMissionService, PlayerBoardMission } from 'src/services/board-mission.service';
import { ViewportService } from 'src/services/viewport.service';
import { RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-mission-board',
  templateUrl: './mission-board.component.html',
  styleUrls: ['./mission-board.component.scss']
})
export class MissionBoardComponent implements OnInit {
  @Input() missions: BoardMission[] = [];
  @Input() playerMissions: PlayerBoardMission[] = [];
  @Input() activeMission: PlayerBoardMission = null;
  @Input() loading = false;

  @Output() missionsUpdated = new EventEmitter<void>();

  selectedFilter: 'ALL' | 'HUNT' | 'GATHER' = 'ALL';
  prefix = ViewportService.getPreffixImg();

  constructor(
    private boardMissionService: BoardMissionService,
    private store: Store
  ) { }

  ngOnInit(): void {
  }

  filterMissions(type: 'ALL' | 'HUNT' | 'GATHER') {
    this.selectedFilter = type;
  }

  getFilteredMissions(): BoardMission[] {
    if (this.selectedFilter === 'ALL') return this.missions;
    return this.missions.filter(mission => mission.type === this.selectedFilter);
  }

  refreshMissions() {
    this.missionsUpdated.emit();
  }

  async acceptMission(mission: BoardMission) {
    try {
      await this.boardMissionService
        .acceptMission(mission.id)
        .toPromise();
      this.refreshMissions();
      this.store.dispatch(new RefreshPlayer());
    } catch (error) {
      console.error('Error accepting mission:', error);
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

  getUrukIcons(rewardLevel: number): number[] {
    return Array(rewardLevel - 1).fill(0);
  }
}
