import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { lowerCase } from 'lodash-es';
import * as party from 'party-js';
import { firstValueFrom, take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  FightResultModel,
  GankMonstersIds,
} from 'src/modules/core/models/fight.model';
import { getRarityColor } from 'src/modules/utils';
import { QuestService } from 'src/services/quest.service';
import { SoundService } from 'src/services/sound.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer, SetQuests } from 'src/store/main.store';
import { QuestStatusEnum } from '../enums/quest-status.enum';
import { QuestRouterModel } from '../models/quest-router.model';

@Component({
  selector: 'app-quest-result',
  templateUrl: './quest-result.component.html',
  styleUrl: './quest-result.component.scss',
})
export class QuestResultComponent extends TemplatePage {
  @ViewChild('lootItem', { read: ElementRef }) loot: ElementRef;
  @ViewChild('levelUp', { read: ElementRef }) levelUp: ElementRef;
  fightResult: FightResultModel;
  store = inject(Store);
  viewportService = inject(ViewportService);
  questService = inject(QuestService);
  titleService = inject(Title);
  soundService = inject(SoundService);
  victory = false;
  questStatusEnum = QuestStatusEnum;
  player = this.store.selectSnapshot(MainState.getState).player;
  getRarityColor = getRarityColor;
  public lowerCaseFn = lowerCase;
  public questResultLayout: 'DEFAULT' | 'GANKED' = 'DEFAULT';

  constructor() {
    super();
    this.titleService.setTitle('Quest result');
  }

  @Output() questStatusChange = new EventEmitter<QuestRouterModel>();
  @Input() set result(fightResult: FightResultModel) {
    if (fightResult) {
      this.fightResult = fightResult;
      this.victory = !!fightResult.player;
      this.updateQuests();
      if (this.victory) {
        if (
          fightResult.loot &&
          (!fightResult.lostLoot || fightResult.lostLoot.length == 0)
        ) {
          setTimeout(() => {
            party.confetti(this.loot.nativeElement, {
              count: party.variation.range(20, 40),
            });
          });
        }
        if (fightResult.player?.level > this.player.level) {
          setTimeout(() => {
            party.sparkles(this.levelUp.nativeElement, {
              count: party.variation.range(20, 40),
            });
          });
        }
        this.store.dispatch(new RefreshPlayer());
      }
    }
  }

  private updateQuests() {
    this.questService
      .getActive()
      .pipe(take(1))
      .subscribe((quests) => this.store.dispatch(new SetQuests(quests)));
  }

  public getItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 62.5;
    }
    return 125;
  }

  public thereIsLoot(fightResult: FightResultModel) {
    return (
      fightResult.loot ||
      fightResult.lostLoot ||
      fightResult.consumableLoot ||
      fightResult.consumableLostLoot ||
      fightResult.materialLoot ||
      fightResult.materialLostLoot ||
      fightResult.miscellanyLoot ||
      fightResult.miscellanyLostLoot
    );
  }

  public continueTrouble() {
    this.questResultLayout = 'GANKED';
    this.soundService.playSound('assets/sounds/battle-horn.mp3');
  }

  public async faceIt() {
    const foundMonster = GankMonstersIds.find(
      (entry) => entry.monster == this.fightResult.ganked
    );
    await firstValueFrom(
      this.questService.startGank(foundMonster.questId, foundMonster.monster)
    );
    setTimeout(() => {
      this.questStatusChange.emit({
        status: this.questStatusEnum.PICKING,
        force: true,
      });
    }, 100);
  }
}
