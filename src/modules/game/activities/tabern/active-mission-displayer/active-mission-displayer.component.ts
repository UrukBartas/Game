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
}
