import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';
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
import { ItemPickerComponent } from 'src/modules/game/components/item-picker/item-picker.component';
import { AchievementsComponent } from 'src/standalone/achievements/achievements.component';
import { BalanceSelectorComponent } from 'src/standalone/balance-selector/balance-selector.component';
import { CharacterClassInfoComponent } from 'src/standalone/character-class-info/character-class-info.component';
import { BlacksmithContextMenuComponent } from 'src/standalone/context-menu/blacksmith-context-menu/blacksmith-context-menu.component';
import { ContextMenuInventoryOptionsComponent } from 'src/standalone/context-menu/context-menu-inventory-options/context-menu-inventory-options.component';
import { ContextMenuComponent } from 'src/standalone/context-menu/context-menu.component';
import { ExpandInventoryTooltipComponent } from 'src/standalone/expand-inventory-tooltip/expand-inventory-tooltip.component';
import { GenericItemTooltipComponent } from 'src/standalone/generic-item-tooltip/generic-item-tooltip.component';
import { ItemRouletteComponent } from 'src/standalone/item-roulette/item-roulette.component';
import { ItemTooltipComponent } from 'src/standalone/item-tooltip/item-tooltip.component';
import { MinMaxComboSelectorComponent } from 'src/standalone/min-max-combo-selector/min-max-combo-selector.component';
import { MonsterTypeAvatarComponent } from 'src/standalone/monster-type-avatar/monster-type-avatar.component';
import { RankBadgeComponent } from 'src/standalone/rank-badge/rank-badge.component';
import { RemoteItemBoxComponent } from 'src/standalone/remote-item-box/remote-item-box.component';
import { SpinnerComponent } from 'src/standalone/spinner/spinner.component';
import { TierizedProgressBarComponent } from 'src/standalone/tierized-progress-bar/tierized-progress-bar.component';
import { SwiperModule } from 'swiper/angular';
import { ChainSwitcherComponent } from '../../standalone/chain-switcher/chain-switcher.component';
import { ChanceDisplayerComponent } from '../../standalone/chance-displayer/chance-displayer.component';
import { ItemBoxComponent } from '../../standalone/item-box/item-box.component';
import { LootboxStatsDisplayerComponent } from '../../standalone/lootbox-stats-displayer/lootbox-stats-displayer.component';
import { ProgressBarComponent } from '../../standalone/progress-bar/progress-bar.component';
import { UruksDisplayerComponent } from '../../standalone/uruks-displayer/uruks-displayer.component';
import { BaseFightComponent } from '../core/components/base-fight/base-fight.component';
import { FightLogsModalComponent } from '../core/components/base-fight/components/fight-logs-modal/fight-logs-modal.component';
import { FighterStatsTooltipComponent } from '../core/components/base-fight/components/fighter-stats-tooltip/fighter-stats-tooltip.component';
import { FighterStatusComponent } from '../core/components/base-fight/components/fighter-status/fighter-status.component';
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
import { AutoPvpFightComponent } from './activities/pvp/pvp-autofight/pvp-autofight.component';
import { PvPFightComponent } from './activities/pvp/pvp-fight/pvp-fight.component';
import { PvPResultComponent } from './activities/pvp/pvp-result/pvp-result.component';
import { QuestFightComponent } from './activities/quests/quest-fight/quest-fight.component';
import { QuestPickerComponent } from './activities/quests/quest-picker/quest-picker.component';
import { QuestProgressComponent } from './activities/quests/quest-progress/quest-progress.component';
import { QuestResultComponent } from './activities/quests/quest-result/quest-result.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { ReferralsComponent } from './activities/referrals/referrals.component';
import { DailyRollButtonComponent } from './activities/shop/components/daily-roll-button.component';
import { ShopComponent } from './activities/shop/shop.component';
import { ShoppingComponent } from './activities/shopping/shopping.component';
import { ActiveMissionDisplayerComponent } from './activities/tabern/active-mission-displayer/active-mission-displayer.component';
import { FortuneWheelComponent } from './activities/tabern/fortune-wheel/fortune-wheel.component';
import { MissionBoardComponent } from './activities/tabern/mission-board/mission-board.component';
import { TabernComponent } from './activities/tabern/tabern.component';
import { CryptFightComponent } from './activities/the-crypt/components/crypt-fight/crypt-fight.component';
import { CryptFinishedComponent } from './activities/the-crypt/components/crypt-finished/crypt-finished.component';
import { CryptPlayerStateComponent } from './activities/the-crypt/components/crypt-player-state/crypt-player-state.component';
import { CryptProgressComponent } from './activities/the-crypt/components/crypt-progress/crypt-progress.component';
import { CryptResultComponent } from './activities/the-crypt/components/crypt-result/crypt-result.component';
import { CryptRewardPickerComponent } from './activities/the-crypt/components/crypt-reward-picker/crypt-reward-picker.component';
import { CryptStartComponent } from './activities/the-crypt/components/crypt-start/crypt-start.component';
import { CryptoFailedComponent } from './activities/the-crypt/components/crypto-failed/crypto-failed.component';
import { RoomsListComponent } from './activities/the-crypt/components/rooms-list/rooms-list.component';
import { TheCryptComponent } from './activities/the-crypt/the-crypt.component';
import { StakeRemoveRequestModalComponent } from './activities/the-mine/stake-remove-request-modal/stake-remove-request-modal.component';
import { TheMineComponent } from './activities/the-mine/the-mine.component';
import { BaseInventoryComponent } from './components/base-inventory/base-inventory.component';
import { ChallengeModalComponent } from './components/challenge-modal/challenge-modal.component';
import { ChatComponent } from './components/chat/chat.component';
import { ConsumableModalComponent } from './components/consumable-modal/consumable-modal.component';
import { ConsumablesInventoryComponent } from './components/consumables-inventory/consumables-inventory.component';
import { EmojiSelectorComponent } from './components/emoji-selector/emoji-selector.component';
import { FightEmojisComponent } from './components/fight-emojis/fight-emojis.component';
import { FightHistoricComponent } from './components/fight-historic/fight-historic.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { InventoryTopbarComponent } from './components/inventory-topbar/inventory-topbar.component';
import { ItemInventoryComponent } from './components/item-inventory/item-inventory.component';
import { ItemPickerDialogComponent } from './components/item-picker-dialog/item-picker-dialog.component';
import { MaterialsInventoryComponent } from './components/materials-inventory/materials-inventory.component';
import { MiscInventoryComponent } from './components/misc-inventory/misc-inventory.component';
import { NamePlayerComponent } from './components/name-player/name-player.component';
import { GenericStatsComponent } from './components/stats-detail/only-stats/only-stats/generic-stats/generic-stats.component';
import { OnlyStatsComponent } from './components/stats-detail/only-stats/only-stats/only-stats.component';
import { PercentStatsComponent } from './components/stats-detail/only-stats/only-stats/percent-stats/percent-stats.component';
import { StatsDetailComponent } from './components/stats-detail/stats-detail.component';
import { TitleGeneratorModalComponent } from './components/title-generator-modal/title-generator-modal.component';
import { AuctionHouseTutorialComponent } from './components/tutorials/auction-house-tutorial/auction-house-tutorial.component';
import { BaseTutorialComponent } from './components/tutorials/base-tutorial/base-tutorial.component';
import { BlacksmithTutorialComponent } from './components/tutorials/blacksmith-tutorial/blacksmith-tutorial.component';
import { BridgeTutorialComponent } from './components/tutorials/bridge-tutorial/bridge-tutorial.component';
import { CryptTutorialComponent } from './components/tutorials/crypt-tutorial/crypt-tutorial.component';
import { InventoryTutorialComponent } from './components/tutorials/inventory-tutorial/inventory-tutorial.component';
import { LeaderboardTutorialComponent } from './components/tutorials/leaderboard-tutorial/leaderboard-tutorial.component';
import { MineTutorialComponent } from './components/tutorials/mine-tutorial/mine-tutorial.component';
import { QuestTutorialComponent } from './components/tutorials/quest-tutorial/quest-tutorial.component';
import { ShopTutorialComponent } from './components/tutorials/shop-tutorial/shop-tutorial.component';
import { TabernTutorialComponent } from './components/tutorials/tabern-tutorial/tabern-tutorial.component';
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
  AutoPvpFightComponent,
  BaseFightComponent,
  FighterStatusComponent,
  FighterStatsTooltipComponent,
  FightLogsModalComponent,
  TabernTutorialComponent,
  TabernComponent,
  FightEmojisComponent,
  EmojiSelectorComponent,
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
    TheCryptComponent,
    CryptRewardPickerComponent,
    CryptProgressComponent,
    CryptFightComponent,
    CryptResultComponent,
    CryptFinishedComponent,
    CryptStartComponent,
    CryptoFailedComponent,
    RoomsListComponent,
    CryptPlayerStateComponent,
    ShoppingComponent,
    ItemPickerComponent,
    ItemPickerDialogComponent,
    InventoryTutorialComponent,
    BaseTutorialComponent,
    AuctionHouseTutorialComponent,
    QuestTutorialComponent,
    ShopTutorialComponent,
    CryptTutorialComponent,
    BlacksmithTutorialComponent,
    MineTutorialComponent,
    BridgeTutorialComponent,
    LeaderboardTutorialComponent,
    TabernTutorialComponent,
    ReferralsComponent,
    ActiveMissionDisplayerComponent,
    MissionBoardComponent,
    FortuneWheelComponent,
    EmojiSelectorComponent,
    FightEmojisComponent,
    ChatComponent
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
    SwiperModule,
    ChanceDisplayerComponent,
    LootboxStatsDisplayerComponent,
    NgxEchartsModule,
    MinMaxComboSelectorComponent,
    UruksDisplayerComponent,
    RemoteItemBoxComponent,
    QRCodeModule,
    MonsterTypeAvatarComponent,
    RankBadgeComponent, AchievementsComponent,
    CharacterClassInfoComponent
  ],
  exports: [
    GameLayoutComponent,
    ItemInventoryComponent,
    MaterialsInventoryComponent,
    ConsumablesInventoryComponent,
    MiscInventoryComponent,
    ItemPickerComponent,
    ItemPickerDialogComponent,
  ],
  providers: [DecimalPipe, AsyncPipe, StackPipe, ...pipes],
})
export class GameModule { }
