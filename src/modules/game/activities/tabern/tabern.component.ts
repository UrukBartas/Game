import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { BoardMission, BoardMissionService, PlayerBoardMission } from 'src/services/board-mission.service';
import { ViewportService } from 'src/services/viewport.service';
import { ChatMessage, WebSocketService } from 'src/services/websocket.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-tabern',
  templateUrl: './tabern.component.html',
  styleUrl: './tabern.component.scss'
})
export class TabernComponent extends TemplatePage implements OnInit, OnDestroy {
  isChatExpanded = false;
  missions: BoardMission[] = [];
  playerMissions: PlayerBoardMission[] = [];
  selectedFilter: 'ALL' | 'HUNT' | 'GATHER' = 'ALL';
  loading = false;
  activeMission: PlayerBoardMission = null;
  store = inject(Store)
  prefix = ViewportService.getPreffixImg();

  @ViewChild('chatContainer') chatContainer: ElementRef;

  messages: ChatMessage[] = [];
  messageInput = new FormControl('');
  private chatSubscription: Subscription;
  public onlinePlayers$ = this.webSocketService.onlineChatPlayers$;
  toast = inject(ToastrService);
  private showedAdBlockerWarning = false;
  currentTavernSection: 'missions' | 'games' | 'shop' = 'missions';

  constructor(
    private boardMissionService: BoardMissionService,
    private webSocketService: WebSocketService
  ) {
    super();
  }

  getUrukIcons(rewardLevel: number): number[] {
    // Convertir 2->1, 3->2, 4->3 iconos
    return Array(rewardLevel - 1).fill(0);
  }

  ngOnInit() {
    this.refreshMissions();

    // Suscripción al chat
    this.chatSubscription = this.webSocketService.chatMessages$.subscribe(
      messages => {
        this.messages = messages;
        this.scrollToBottom();
      }
    );

    // Solicitar lista de jugadores en línea
    this.webSocketService.requestOnlinePlayers();

    // Unirse al chat global
    this.webSocketService.joinGlobalChat();
    this.webSocketService.getChatHistory();
  }



  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    this.webSocketService.leaveGlobalChat();
  }

  sendMessage() {
    const message = this.messageInput.value?.trim();
    if (message) {
      this.webSocketService.sendMessage(message);
      this.messageInput.reset();
    }
  }

  toggleChat() {
    this.isChatExpanded = !this.isChatExpanded;
    if (this.isChatExpanded) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        const element = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    });
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

  getCurrentUsername(): string {
    return ((this.store.selectSnapshot(MainState.getState))?.player as PlayerModel)?.name || '';
  }

  getPlayerNameColor(username: string): { color: string } {
    // Genera un color basado en el nombre de usuario
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Genera un tono de azul/verde para que sea legible
    const h = hash % 50 + 180; // Rango de 180-230 (tonos de azul/verde)
    const s = 70; // Saturación fija al 70%
    const l = 60; // Luminosidad fija al 60%

    return {
      color: `hsl(${h}, ${s}%, ${l}%)`
    };
  }

  switchTavernSection(section: 'missions' | 'games' | 'shop'): void {
    this.currentTavernSection = section;

    if (section === 'missions') {
      this.refreshMissions();
    }
  }
}
