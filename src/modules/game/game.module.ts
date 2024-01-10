import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { CharacterComponent } from './activities/character/character.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ItemBoxComponent } from 'src/standalone/item-box/item-box.component';
import { StatsDetailComponent } from './activities/stats-detail/stats-detail.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
@NgModule({
  declarations: [
    GameLayoutComponent,
    CharacterComponent,
    StatsDetailComponent,
    ExportImportNftComponent,
  ],
  imports: [CommonModule, GameRoutingModule, NgbModule, ItemBoxComponent],
  exports: [GameLayoutComponent],
})
export class GameModule {}
