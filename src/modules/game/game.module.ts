import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ItemBoxComponent } from '../../standalone/item-box/item-box.component';
import { ValidInputDirective } from '../core/directives/valid-input.directive';
import { CharacterComponent } from './activities/character/character.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { QuestsComponent } from './activities/quests/quests.component';
import { StatsDetailComponent } from './activities/stats-detail/stats-detail.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { GameRoutingModule } from './game-routing.module';
@NgModule({
  declarations: [
    GameLayoutComponent,
    CharacterComponent,
    StatsDetailComponent,
    EditCharacterComponent,
    ExportImportNftComponent,
    ValidInputDirective,
    QuestsComponent,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    NgbModule,
    ItemBoxComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [GameLayoutComponent],
})
export class GameModule {}
