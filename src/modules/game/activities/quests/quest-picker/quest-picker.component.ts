import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { firstValueFrom, interval, map, take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { getRarityColor } from 'src/modules/utils';
import { QuestService } from 'src/services/quest.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, SetQuests } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';
import { Rarity } from 'src/modules/core/models/items.model';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { PlayerService } from 'src/services/player.service';
import { Title } from '@angular/platform-browser';
import { Adventure } from 'src/services/adventures.service';
import { AdventureData } from 'src/services/adventures-data.service';

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
  activeSlideIndex = 0;
  modalService = inject(BsModalService);
  titleService = inject(Title);

  public slots$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player.sockets));

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

  constructor(
    private store: Store,
    public viewportService: ViewportService,
    private questService: QuestService,
    private playerService: PlayerService
  ) {
    super();
    this.titleService.setTitle('Pick an adventure');
  }

  ngOnInit(): void {
    this.getPlayerQuests();
  }

  getPlayerQuests() {
    // if (this.adventure) {
    //   this.quests = this.adventure.quests;
    //   return;
    // }
    this.questService
      .getActive()
      .pipe(take(1))
      .subscribe((quests) => {
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
      });
  }

  previousSlide() {
    if (this.activeSlideIndex > 0) {
      this.activeSlideIndex--;
      const carousel: HTMLElement = document.querySelector('.carousel');
      carousel.style.transform = `translateX(-${this.activeSlideIndex * 100}%)`;
    }
  }

  nextSlide() {
    // if (!!this.adventure &&  this.activeSlideIndex + 1 > this.adventure.currentPhase) {
    //   return;
    // }

    if (this.activeSlideIndex < this.quests.length - 1) {
      this.activeSlideIndex++;
      const carousel: HTMLElement = document.querySelector('.carousel');
      carousel.style.transform = `translateX(-${this.activeSlideIndex * 100}%)`;
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
      .start(this.quests[this.activeSlideIndex].data.id)
      .subscribe(({ startedAt, finishedAt }) => {
        this.quests[this.activeSlideIndex].startedAt = startedAt;
        this.quests[this.activeSlideIndex].finishedAt = finishedAt;
        this.store.dispatch(new SetQuests(this.quests));
        this.questStatusChange.emit({ status: QuestStatusEnum.IN_PROGRESS });
      });
  }

  getResponsiveButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return '0.8em 3em';
      case 'md':
        return '0.4em 1.5em';
      case 'xs':
      case 'sm':
      default:
        return '0.3em 1em';
    }
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
        return '3.25rem';
    }
  }
}
