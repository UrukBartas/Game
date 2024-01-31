import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ItemBoxComponent } from '../../standalone/item-box/item-box.component';
import { ValidInputDirective } from '../core/directives/valid-input.directive';
import { QuestProgressComponent } from './activities/quests/quest-progress/quest-progress.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { QuestPickerComponent } from './activities/quests/quest-picker/quest-picker.component';
import { StatsDetailComponent } from './activities/stats-detail/stats-detail.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { GameRoutingModule } from './game-routing.module';
import { InventoryComponent } from './activities/inventory/inventory.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { QuestFightComponent } from './activities/quests/quest-fight/quest-fight.component';
import { TextSizeDirective } from '../core/directives/text-size.directive';
import { TitleSizeDirective } from '../core/directives/title-size.directive';
import { ProgressBarComponent } from '../../standalone/progress-bar/progress-bar.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ItemTooltipComponent } from 'src/standalone/item-tooltip/item-tooltip.component';

const directives = [ValidInputDirective, TextSizeDirective, TitleSizeDirective];
const components = [
  GameLayoutComponent,
  InventoryComponent,
  StatsDetailComponent,
  EditCharacterComponent,
  ExportImportNftComponent,
  QuestRouterComponent,
  QuestPickerComponent,
  QuestProgressComponent,
  QuestFightComponent,
];

@NgModule({
  declarations: [...components, ...directives],
  imports: [
    CommonModule,
    GameRoutingModule,
    NgbModule,
    ItemBoxComponent,
    FormsModule,
    ReactiveFormsModule,
    ProgressBarComponent,
    CarouselModule,
    ItemTooltipComponent,
  ],
  exports: [GameLayoutComponent],
})
export class GameModule {}
