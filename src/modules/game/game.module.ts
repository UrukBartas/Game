import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { DndModule } from 'ngx-drag-drop';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { BlacksmithContextMenuComponent } from 'src/standalone/context-menu/blacksmith-context-menu/blacksmith-context-menu.component';
import { ContextMenuInventoryOptionsComponent } from 'src/standalone/context-menu/context-menu-inventory-options/context-menu-inventory-options.component';
import { ContextMenuComponent } from 'src/standalone/context-menu/context-menu.component';
import { ExpandInventoryTooltipComponent } from 'src/standalone/expand-inventory-tooltip/expand-inventory-tooltip.component';
import { GenericItemTooltipComponent } from 'src/standalone/generic-item-tooltip/generic-item-tooltip.component';
import { ItemRouletteComponent } from 'src/standalone/item-roulette/item-roulette.component';
import { ItemTooltipComponent } from 'src/standalone/item-tooltip/item-tooltip.component';
import { SpinnerComponent } from 'src/standalone/spinner/spinner.component';
import { ItemBoxComponent } from '../../standalone/item-box/item-box.component';
import { ProgressBarComponent } from '../../standalone/progress-bar/progress-bar.component';
import { DoubleClickDirective } from '../core/directives/double-click.directive';
import { SubtitleSizeDirective } from '../core/directives/subtitle-size.directive';
import { TextSizeDirective } from '../core/directives/text-size.directive';
import { TitleSizeDirective } from '../core/directives/title-size.directive';
import { ValidInputDirective } from '../core/directives/valid-input.directive';
import { CapitalizeFirstPipe } from '../core/pipes/capitalize-first.pipe';
import { CompressNumberPipe } from '../core/pipes/compress-number.pipe';
import { ItemdataToItemPipe } from '../core/pipes/itemdata-to-item.pipe';
import { OrderByPipe } from '../core/pipes/order-by.pipe';
import { StackPipe } from '../core/pipes/stack.pipe';
import { AdventurePickerComponent } from './activities/adventures/adventure-picker/adventure-picker.component';
import { AdventuresRouterComponent } from './activities/adventures/adventures-router.component';
import { AdventuresComponent } from './activities/adventures/adventures.component';
import { BlacksmithComponent } from './activities/blacksmith/blacksmith.component';
import { BlacksmithModalComponent } from './activities/blacksmith/modal/blacksmith-modal.component';
import { RegisterReferralComponent } from './activities/campaigns/register-referral/register-referral.component';
import { ConnectComponent } from './activities/connect/connect.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { InventoryComponent } from './activities/inventory/inventory.component';
import { LeadeboardComponent } from './activities/leadeboard/leadeboard.component';
import { PvPFightComponent } from './activities/pvp/pvp-fight.component';
import { QuestFightComponent } from './activities/quests/quest-fight/quest-fight.component';
import { QuestPickerComponent } from './activities/quests/quest-picker/quest-picker.component';
import { QuestProgressComponent } from './activities/quests/quest-progress/quest-progress.component';
import { QuestResultComponent } from './activities/quests/quest-result/quest-result.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { DailyRollButtonComponent } from './activities/shop/components/daily-roll-button.component';
import { ShopComponent } from './activities/shop/shop.component';
import { ChallengeModalComponent } from './components/challengee-modal/challenge-modal.component';
import { ConsumableModalComponent } from './components/consumable-modal/consumable-modal.component';
import { ConsumablesInventoryComponent } from './components/consumables-inventory/consumables-inventory.component';
import { FightHistoricComponent } from './components/fight-historic/fight-historic.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { InventoryTopbarComponent } from './components/inventory-topbar/inventory-topbar.component';
import { ItemInventoryComponent } from './components/item-inventory/item-inventory.component';
import { MaterialsInventoryComponent } from './components/materials-inventory/materials-inventory.component';
import { MiscInventoryComponent } from './components/misc-inventory/misc-inventory.component';
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
  ChallengeModalComponent,
  PvPFightComponent,
  FightHistoricComponent
];

const pipes = [
  ItemdataToItemPipe,
  CapitalizeFirstPipe,
  OrderByPipe,
  StackPipe,
  CompressNumberPipe,
];

@NgModule({
  declarations: [
    ...components,
    LeadeboardComponent,
    RegisterReferralComponent,
    ItemInventoryComponent,
    ConsumablesInventoryComponent,
    AdventuresComponent,
    AdventurePickerComponent,
    AdventuresRouterComponent,
    MaterialsInventoryComponent,
    InventoryTopbarComponent,
    MiscInventoryComponent,
  ],
  imports: [
    ...directives,
    ...pipes,
    CommonModule,
    TabsModule,
    GameRoutingModule,
    NgbModule,
    ItemBoxComponent,
    FormsModule,
    ReactiveFormsModule,
    ProgressBarComponent,
    CarouselModule,
    ItemTooltipComponent,
    ExpandInventoryTooltipComponent,
    GenericItemTooltipComponent,
    DoubleClickDirective,
    DndModule,
    ContextMenuComponent,
    ContextMenuInventoryOptionsComponent,
    BlacksmithContextMenuComponent,
    NgxSpinnerModule,
    SpinnerComponent,
    ItemRouletteComponent,
  ],
  exports: [GameLayoutComponent],
  providers: [DecimalPipe, AsyncPipe],
})
export class GameModule {}
