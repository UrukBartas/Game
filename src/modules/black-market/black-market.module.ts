import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { PresaleContractService } from 'src/services/contracts/presale-contract.service';
import { ChainSwitcherComponent } from 'src/standalone/chain-switcher/chain-switcher.component';
import { LootboxStatsDisplayerComponent } from 'src/standalone/lootbox-stats-displayer/lootbox-stats-displayer.component';
import { SwiperModule } from 'swiper/angular';
import { BlackMarketComponent } from './components/black-market/black-market.component';
import { LootboxPresaleComponent } from './components/lootbox-presale/lootbox-presale.component';
import { MerchComponent } from './components/merch/merch.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { LootboxPresaleThreeService } from './services/lootbox-presale-threejs.service';

const routes: Routes = [
  {
    path: '',
    component: BlackMarketComponent
  }
]

@NgModule({
  declarations: [
    BlackMarketComponent,
    LootboxPresaleComponent,
    MerchComponent,
    ProductDetailComponent,
    ShoppingCartComponent
  ],
  imports: [
    CommonModule,
    SwiperModule,
    NgxSliderModule,
    ChainSwitcherComponent,
    LootboxStatsDisplayerComponent,
    AccordionModule,
    RouterModule.forChild(routes),
    FormsModule
  ],
  exports: [
    BlackMarketComponent
  ],
  providers: [LootboxPresaleThreeService, PresaleContractService],
})
export class BlackMarketModule { }
