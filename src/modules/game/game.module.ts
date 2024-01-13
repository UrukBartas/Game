import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { CharacterComponent } from './activities/character/character.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ItemBoxComponent } from 'src/standalone/item-box/item-box.component';
import { StatsDetailComponent } from './activities/stats-detail/stats-detail.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    GameLayoutComponent,
    CharacterComponent,
    StatsDetailComponent,
    EditCharacterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    GameRoutingModule,
    NgbModule,
    ItemBoxComponent,
  ],
  exports: [GameLayoutComponent],
})
export class GameModule {}
