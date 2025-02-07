import {
    Component,
    computed,
    EventEmitter,
    inject,
    Input,
    Output,
    signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { firstValueFrom, map, take, tap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Rarity } from 'src/modules/core/models/items.model';
import {
    MonsterType,
    QuestDataModel,
} from 'src/modules/core/models/quest-data.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { getRarityColor } from 'src/modules/utils';
import { AdventureData } from 'src/services/adventures-data.service';
import { AdventuresService } from 'src/services/adventures.service';
import { PlayerService } from 'src/services/player.service';
import { QuestService } from 'src/services/quest.service';
import { StatsService } from 'src/services/stats.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, SetQuests } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';

@Component({
  selector: 'app-quest-picker',
  templateUrl: './quest-picker.component.html',
  styleUrl: './quest-picker.component.scss',
})
export class QuestPickerComponent extends TemplatePage {
  @Input() public set adventure(data: AdventureData) {
    this._adventure = data;
    this.getPlayerQuests();
  }
  public get adventure() {
    return this._adventure;
  }
  private _adventure: AdventureData;
  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();

  quests: QuestModel[];
  getRarityColor = getRarityColor;
  activeSlideIndex = signal(0);
  modalService = inject(BsModalService);
  titleService = inject(Title);
  statService = inject(StatsService);
  @Output() questChanged = new EventEmitter<QuestModel>();
  loading = false;
  public prefix = ViewportService.getPreffixImg();

  public slots$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player.sockets));

  public infoEffectiveness$ = computed(() => {
    const activeQuest = this.quests[this.activeSlideIndex()];
    const type = activeQuest.data.monsterType;
    return this.statService
      .getMonsterWeakness()
      .pipe(map((entry) => entry[type]));
  });

  public getApproxTimeOfQuestBasedOnRarity = (rarity: Rarity) => {
    switch (rarity) {
      case 'COMMON':
        return '10-15 minutes';
      case 'UNCOMMON':
        return '15-20 minutes';
      case 'EPIC':
        return '20-30 minutes';
      case 'LEGENDARY':
        return '30-60 minutes';
      case 'MYTHIC':
        return '1-4 hours';
      default:
        return '30 minutes';
    }
  };

  public getNameBasedOnType = (type: MonsterType) => {
    switch (type) {
      case MonsterType.MAGIC_BEAST:
        return 'Magic Beast';
      case MonsterType.GIANT_INSECT:
        return 'Giant Insect';
      default:
        return type;
    }
  };

  public getPathMonsterType = (questData: QuestDataModel) => {
    return ViewportService.getPreffixImg()+ `/assets/quests/types/${questData.monsterType}.png`;
  };

  constructor(
    private store: Store,
    public viewportService: ViewportService,
    private questService: QuestService,
    private playerService: PlayerService,
    private adventureService: AdventuresService
  ) {
    super();
    this.titleService.setTitle('Pick an adventure');
  }

  public isCurrentQuestTheNextPhase() {
    if (!this.adventure || !this.quests) return false;
    let adventureSelected = null;
    if (this.adventure?.Adventure?.length > 0) {
      adventureSelected = this.adventure.Adventure[0];
    }
    return (
      adventureSelected.currentPhase + 1 ==
      this.quests[this.activeSlideIndex()]?.data?.phase
    );
  }

  public isCurrentQuestNonActive() {
    return this.quests[this.activeSlideIndex()].active == false;
  }

  ngOnInit(): void {
    this.getPlayerQuests();
  }

  public unstuckPhase() {
    firstValueFrom(
      this.adventureService
        .unstuckAdventure(this.adventure.id)
        .pipe(tap((e) => this.getPlayerQuests()))
    );
  }

  getPlayerQuests() {
    this.loading = true;
    this.questService
      .getActive()
      .pipe(take(1))
      .subscribe((quests) => {
        this.activeSlideIndex.set(0);
        this.quests = quests.filter((quest) => {
          if (!!this.adventure) {
            return (
              !!quest.data?.isAdventurePhase &&
              !!quest.adventures &&
              quest.adventures.length > 0 &&
              quest.adventures[0].adventureDataId == this.adventure.id
            );
          } else {
            return !quest.data.isAdventurePhase;
          }
        });
        this.store.dispatch(new SetQuests(quests));
        if (this.quests.find((quest) => quest.startedAt !== null)) {
          this.questStatusChange.emit({ status: QuestStatusEnum.IN_PROGRESS });
        }
        this.loading = false;
      });
  }

  previousSlide() {
    if (this.activeSlideIndex() > 0) {
      this.activeSlideIndex.set(this.activeSlideIndex() - 1);
      const carousel: HTMLElement = document.querySelector('.carousel');
      carousel.style.transform = `translateX(-${this.activeSlideIndex() * 100}%)`;
      this.questChanged.emit(this.quests[this.activeSlideIndex()]);
    }
  }

  nextSlide() {
    // if (!!this.adventure &&  this.activeSlideIndex + 1 > this.adventure.currentPhase) {
    //   return;
    // }

    if (this.activeSlideIndex() < this.quests.length - 1) {
      this.activeSlideIndex.set(this.activeSlideIndex() + 1);
      const carousel: HTMLElement = document.querySelector('.carousel');
      carousel.style.transform = `translateX(-${this.activeSlideIndex() * 100}%)`;
      this.questChanged.emit(this.quests[this.activeSlideIndex()]);
    }
  }

  confirmStartQuestWithFullInventory() {
    return new Promise((resolve, reject) => {
      const config: ModalOptions = {
        initialState: {
          title: 'Inventory Full!',
          description: `Your inventory is full. Continuing this quest won't allow you to loot any additional items. Proceed anyway?`,
          accept: async () => {
            modalRef.hide();
            resolve(true);
          },
          cancel: () => {
            resolve(false);
          },
        },
      };
      const modalRef = this.modalService.show(ConfirmModalComponent, config);
    }) as Promise<boolean>;
  }

  async startQuest() {
    let proceedWithQuest = true;
    try {
      const slotsPlayer = await firstValueFrom(this.slots$);
      const itemsPlayer = await firstValueFrom(
        this.playerService.getItemsSize()
      );
      if (itemsPlayer > slotsPlayer) {
        proceedWithQuest = await this.confirmStartQuestWithFullInventory();
      }
    } catch (error) {
      console.error('Error calculating inventory size ', error);
    }
    if (!proceedWithQuest) return;
    this.questService
      .start(this.quests[this.activeSlideIndex()].data.id)
      .subscribe(({ startedAt, finishedAt }) => {
        this.quests[this.activeSlideIndex()].startedAt = startedAt;
        this.quests[this.activeSlideIndex()].finishedAt = finishedAt;
        this.store.dispatch(new SetQuests(this.quests));
        this.questStatusChange.emit({ status: QuestStatusEnum.IN_PROGRESS });
      });
  }

  questRoll() {
    this.questService
      .rollData()
      .pipe(take(1))
      .subscribe((rollData) => {
        const config: ModalOptions = {
          initialState: {
            title: 'Quest Roll',
            description: `Roll prices restart every 24 hours. \nNumber of rolls: ${rollData.rollNumber} \nCurrent roll price is at: ${rollData.price} \n\n Do you want to roll?`,
            accept: async () => {
              this.questService
                .roll()
                .pipe(take(1))
                .subscribe(() => {
                  this.getPlayerQuests();
                });

              modalRef.hide();
            },
          },
        };
        const modalRef = this.modalService.show(ConfirmModalComponent, config);
      });
  }

  getResponsiveButtonFontSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
        return 'calc(1.325rem + 0.9vw)';
      case 'xl':
      case 'lg':
        return 'calc(1.3rem + 0.6vw)';
      case 'md':
        return 'calc(1.275rem + 0.3vw)';
      case 'xs':
      case 'sm':
      default:
        return '1.8rem';
    }
  }
}
