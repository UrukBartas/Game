import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs';
import { MonsterType } from 'src/modules/core/models/quest-data.model';
import { StatsService } from 'src/services/stats.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-monster-type-avatar',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './monster-type-avatar.component.html',
  styleUrl: './monster-type-avatar.component.scss'
})
export class MonsterTypeAvatarComponent {
  @Input() monsterType: MonsterType;
  @Input() showText: boolean = true;
  statService = inject(StatsService);
  public infoEffectiveness$ = computed(() => {
    const type = this.monsterType;
    return this.statService
      .getMonsterWeakness()
      .pipe(map((entry) => entry[type]));
  });

  public getNameBasedOnType(type: MonsterType): string {
    switch (type) {
      case MonsterType.MAGIC_BEAST:
        return 'Magic Beast';
      case MonsterType.GIANT_INSECT:
        return 'Giant Insect';
      default:
        return type;
    }
  }

  public getPathMonsterType(monsterType: MonsterType): string {
    return ViewportService.getPreffixImg() + `/assets/quests/types/${monsterType}.png`;
  }
}
