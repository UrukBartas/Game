import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { CharacterComponent } from './activities/character/character.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [GameLayoutComponent, CharacterComponent],
  imports: [CommonModule, GameRoutingModule,NgbModule],
  exports: [GameLayoutComponent],
})
export class GameModule {}
