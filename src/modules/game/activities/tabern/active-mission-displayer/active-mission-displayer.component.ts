import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoardMissionService, PlayerBoardMission } from 'src/services/board-mission.service';

@Component({
  selector: 'app-active-mission-displayer',
  templateUrl: './active-mission-displayer.component.html',
  styleUrl: './active-mission-displayer.component.scss'
})
export class ActiveMissionDisplayerComponent {
  @Input() activeMission: PlayerBoardMission;
  @Input() smaller = false;
  @Output() updateMissions = new EventEmitter<void>();
  constructor(private boardMissionService: BoardMissionService) { }
  cancelMission() {
    this.boardMissionService.cancelMission(this.activeMission.missionId).subscribe(() => {
      this.activeMission = null;
      this.updateMissions.emit();
    });
  }
  getMissionHint(): string {
    if (!this.activeMission) return '';

    if (this.activeMission.mission.type === 'GATHER') {
      return `To complete this mission, gather ${this.activeMission.mission.gatherCount} materials by exploring and harvesting resources in the world.`;
    } else if (this.activeMission.mission.type === 'HUNT') {
      return `To complete this mission, defeat ${this.activeMission.mission.killCount} monsters of the specified type in combat.`;
    }

    return 'Complete the mission objectives to earn rewards.';
  }
}
