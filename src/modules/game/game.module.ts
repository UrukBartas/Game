import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { DndModule } from 'ngx-drag-drop';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { ConsumableTooltipComponent } from 'src/standalone/consumable-tooltip/consumable-tooltip.component';
import { ContextMenuInventoryOptionsComponent } from 'src/standalone/context-menu/context-menu-inventory-options/context-menu-inventory-options.component';
import { ContextMenuComponent } from 'src/standalone/context-menu/context-menu.component';
import { ExpandInventoryTooltipComponent } from 'src/standalone/expand-inventory-tooltip/expand-inventory-tooltip.component';
import { ItemTooltipComponent } from 'src/standalone/item-tooltip/item-tooltip.component';
import { MaterialTooltipComponent } from 'src/standalone/material-tooltip/material-tooltip.component';
import { ItemBoxComponent } from '../../standalone/item-box/item-box.component';
import { ProgressBarComponent } from '../../standalone/progress-bar/progress-bar.component';
import { DoubleClickDirective } from '../core/directives/double-click.directive';
import { SubtitleSizeDirective } from '../core/directives/subtitle-size.directive';
import { TextSizeDirective } from '../core/directives/text-size.directive';
import { TitleSizeDirective } from '../core/directives/title-size.directive';
import { ValidInputDirective } from '../core/directives/valid-input.directive';
import { CompressNumberPipe } from '../core/pipes/compress-number.pipe';
import { StackPipe } from '../core/pipes/stack.pipe';
import { ToIpfsImageFromCidPipe } from '../core/pipes/to-ipfs-image-from-cid.pipe';
import { BlacksmithComponent } from './activities/blacksmith/blacksmith.component';
import { BlacksmithModalComponent } from './activities/blacksmith/modal/blacksmith-modal.component';
import { RegisterReferralComponent } from './activities/campaigns/register-referral/register-referral.component';
import { ConnectComponent } from './activities/connect/connect.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { InventoryComponent } from './activities/inventory/inventory.component';
import { LeadeboardComponent } from './activities/leadeboard/leadeboard.component';
import { ConsumableModalComponent } from './activities/quests/quest-fight/components/consumable-modal.component';
import { QuestFightComponent } from './activities/quests/quest-fight/quest-fight.component';
import { QuestPickerComponent } from './activities/quests/quest-picker/quest-picker.component';
import { QuestProgressComponent } from './activities/quests/quest-progress/quest-progress.component';
import { QuestResultComponent } from './activities/quests/quest-result/quest-result.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { DailyRollButtonComponent } from './activities/shop/components/daily-roll-button.component';
import { ShopComponent } from './activities/shop/shop.component';
import { ConsumablesInventoryComponent } from './components/consumables-inventory/consumables-inventory.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { ItemInventoryComponent } from './components/item-inventory/item-inventory.component';
import { MaterialsInventoryComponent } from './components/materials-inventory/materials-inventory.component';
import { StatsDetailComponent } from './components/stats-detail/stats-detail.component';
import { GameRoutingModule } from './game-routing.module';

const directives = [
  ValidInputDirective,
  TextSizeDirective,
  TitleSizeDirective,
  SubtitleSizeDirective,
];

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
  QuestResultComponent,
  ConfirmModalComponent,
  ShopComponent,
  BlacksmithComponent,
  BlacksmithModalComponent,
  DailyRollButtonComponent,
  ConsumableModalComponent,
  ConnectComponent,
];

@NgModule({
  declarations: [
    ...components,
    LeadeboardComponent,
    RegisterReferralComponent,
    ItemInventoryComponent,
    ConsumablesInventoryComponent,
    MaterialsInventoryComponent,
  ],
  imports: [
    ...directives,
    CommonModule,
    GameRoutingModule,
    NgbModule,
    ItemBoxComponent,
    FormsModule,
    ReactiveFormsModule,
    ProgressBarComponent,
    CarouselModule,
    ItemTooltipComponent,
    ExpandInventoryTooltipComponent,
    ConsumableTooltipComponent,
    MaterialTooltipComponent,
    DoubleClickDirective,
    ToIpfsImageFromCidPipe,
    StackPipe,
    CompressNumberPipe,
    DndModule,
    ContextMenuComponent,
    ContextMenuInventoryOptionsComponent,
  ],
  exports: [GameLayoutComponent],
  providers: [DecimalPipe, AsyncPipe],
})
export class GameModule {}
