import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { DndModule } from 'ngx-drag-drop';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TimeAgoPipe } from 'src/app/time-ago.pipe';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { BalanceSelectorComponent } from 'src/standalone/balance-selector/balance-selector.component';
import { BlacksmithContextMenuComponent } from 'src/standalone/context-menu/blacksmith-context-menu/blacksmith-context-menu.component';
import { ContextMenuInventoryOptionsComponent } from 'src/standalone/context-menu/context-menu-inventory-options/context-menu-inventory-options.component';
import { ContextMenuComponent } from 'src/standalone/context-menu/context-menu.component';
import { ExpandInventoryTooltipComponent } from 'src/standalone/expand-inventory-tooltip/expand-inventory-tooltip.component';
import { GenericItemTooltipComponent } from 'src/standalone/generic-item-tooltip/generic-item-tooltip.component';
import { ItemRouletteComponent } from 'src/standalone/item-roulette/item-roulette.component';
import { ItemTooltipComponent } from 'src/standalone/item-tooltip/item-tooltip.component';
import { MinMaxComboSelectorComponent } from 'src/standalone/min-max-combo-selector/min-max-combo-selector.component';
import { SpinnerComponent } from 'src/standalone/spinner/spinner.component';
import { TierizedProgressBarComponent } from 'src/standalone/tierized-progress-bar/tierized-progress-bar.component';
import { SwiperModule } from 'swiper/angular';
import { ChainSwitcherComponent } from '../../standalone/chain-switcher/chain-switcher.component';
import { ChanceDisplayerComponent } from '../../standalone/chance-displayer/chance-displayer.component';
import { ItemBoxComponent } from '../../standalone/item-box/item-box.component';
import { LootboxStatsDisplayerComponent } from '../../standalone/lootbox-stats-displayer/lootbox-stats-displayer.component';
import { ProgressBarComponent } from '../../standalone/progress-bar/progress-bar.component';
import { DoubleClickDirective } from '../core/directives/double-click.directive';
import { SubtextSizeDirective } from '../core/directives/subtext-size.directive';
import { SubtitleSizeDirective } from '../core/directives/subtitle-size.directive';
import { TextSizeDirective } from '../core/directives/text-size.directive';
import { TitleSizeDirective } from '../core/directives/title-size.directive';
import { ValidInputDirective } from '../core/directives/valid-input.directive';
import { CapitalizeFirstPipe } from '../core/pipes/capitalize-first.pipe';
import { CompareItemPipe } from '../core/pipes/compare-item.pipe';
import { CompressNumberPipe } from '../core/pipes/compress-number.pipe';
import { ItemdataToItemPipe } from '../core/pipes/itemdata-to-item.pipe';
import { OrderByPipe } from '../core/pipes/order-by.pipe';
import { StackPipe } from '../core/pipes/stack.pipe';
import { AdventurePickerComponent } from './activities/adventures/adventure-picker/adventure-picker.component';
import { AdventuresRouterComponent } from './activities/adventures/adventures-router.component';
import { AdventuresComponent } from './activities/adventures/adventures.component';
import { AuctionHouseNewTradeComponent } from './activities/auction-house/auction-house-new-trade/auction-house-new-trade.component';
import { AuctionHouseViewItemComponent } from './activities/auction-house/auction-house-view-item/auction-house-view-item.component';
import { AuctionHouseComponent } from './activities/auction-house/auction-house.component';
import { BlacksmithComponent } from './activities/blacksmith/blacksmith.component';
import { BlacksmithModalComponent } from './activities/blacksmith/modal/blacksmith-modal.component';
import { RegisterReferralComponent } from './activities/campaigns/register-referral/register-referral.component';
import { ClassSelectorComponent } from './activities/edit-character/components/character-selector/character-selector.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { InventoryComponent } from './activities/inventory/inventory.component';
import { ItemSetModalComponent } from './activities/inventory/item-set-modal/item-set-modal.component';
import { LeadeboardComponent } from './activities/leadeboard/leadeboard.component';
import { MissionsComponent } from './activities/missions/missions.component';
import { PvPResultComponent } from './activities/pvp/pv-presult/pvp-result.component';
import { PvPFightComponent } from './activities/pvp/pvp-fight/pvp-fight.component';
import { QuestFightComponent } from './activities/quests/quest-fight/quest-fight.component';
import { QuestPickerComponent } from './activities/quests/quest-picker/quest-picker.component';
import { QuestProgressComponent } from './activities/quests/quest-progress/quest-progress.component';
import { QuestResultComponent } from './activities/quests/quest-result/quest-result.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { DailyRollButtonComponent } from './activities/shop/components/daily-roll-button.component';
import { ShopComponent } from './activities/shop/shop.component';
import { StakeRemoveRequestModalComponent } from './activities/the-mine/stake-remove-request-modal/stake-remove-request-modal.component';
import { TheMineInfoModalComponent } from './activities/the-mine/the-mine-help/the-mine-info-modal.component';
import { TheMineComponent } from './activities/the-mine/the-mine.component';
import { BaseInventoryComponent } from './components/base-inventory/base-inventory.component';
import { ChallengeModalComponent } from './components/challengee-modal/challenge-modal.component';
import { ConsumableModalComponent } from './components/consumable-modal/consumable-modal.component';
import { ConsumablesInventoryComponent } from './components/consumables-inventory/consumables-inventory.component';
import { FightHistoricComponent } from './components/fight-historic/fight-historic.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { InventoryTopbarComponent } from './components/inventory-topbar/inventory-topbar.component';
import { ItemInventoryComponent } from './components/item-inventory/item-inventory.component';
import { MaterialsInventoryComponent } from './components/materials-inventory/materials-inventory.component';
import { MiscInventoryComponent } from './components/misc-inventory/misc-inventory.component';
import { NamePlayerComponent } from './components/name-player/name-player.component';
import { GenericStatsComponent } from './components/stats-detail/only-stats/only-stats/generic-stats/generic-stats.component';
import { OnlyStatsComponent } from './components/stats-detail/only-stats/only-stats/only-stats.component';
import { PercentStatsComponent } from './components/stats-detail/only-stats/only-stats/percent-stats/percent-stats.component';
import { StatsDetailComponent } from './components/stats-detail/stats-detail.component';
import { TitleGeneratorModalComponent } from './components/title-generator-modal/title-generator-modal.component';
import { GameRoutingModule } from './game-routing.module';
const directives = [
  ValidInputDirective,
  TextSizeDirective,
  TitleSizeDirective,
  SubtitleSizeDirective,
  SubtextSizeDirective,
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
  ChallengeModalComponent,
  PvPFightComponent,
  PvPResultComponent,
  FightHistoricComponent,
  AuctionHouseNewTradeComponent,
  AuctionHouseComponent,
  MissionsComponent,
];

const pipes = [
  ItemdataToItemPipe,
  CapitalizeFirstPipe,
  OrderByPipe,
  StackPipe,
  CompressNumberPipe,
  TimeAgoPipe,
  CompareItemPipe,
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
    BaseInventoryComponent,
    OnlyStatsComponent,
    GenericStatsComponent,
    PercentStatsComponent,
    AuctionHouseViewItemComponent,
    ItemSetModalComponent,
    TheMineComponent,
    StakeRemoveRequestModalComponent,
    TitleGeneratorModalComponent,
    ClassSelectorComponent,
    NamePlayerComponent,
  ],
  imports: [
    ...directives,
    ...pipes,
    CommonModule,
    TabsModule,
    PaginationModule,
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
    ButtonsModule,
    AccordionModule,
    TierizedProgressBarComponent,
    BalanceSelectorComponent,
    ChainSwitcherComponent,
    TheMineInfoModalComponent,
    SwiperModule,
    ChanceDisplayerComponent,
    LootboxStatsDisplayerComponent,
    NgxEchartsModule,
    MinMaxComboSelectorComponent,
  ],
  exports: [GameLayoutComponent],
  providers: [DecimalPipe, AsyncPipe, StackPipe, ...pipes],
})
export class GameModule {}
