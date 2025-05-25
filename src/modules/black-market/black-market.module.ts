import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AuthGuard } from 'src/guards/auth.guard';
import { PresaleContractService } from 'src/services/contracts/presale-contract.service';
import { ChainSwitcherComponent } from 'src/standalone/chain-switcher/chain-switcher.component';
import { LootboxStatsDisplayerComponent } from 'src/standalone/lootbox-stats-displayer/lootbox-stats-displayer.component';
import { UrukCheckoutButtonComponent } from 'src/standalone/uruk-checkout-button/uruk-checkout-button.component';
import { SwiperModule } from 'swiper/angular';
import { BlackMarketComponent } from './components/black-market/black-market.component';
import { CheckoutModalComponent } from './components/checkout-modal/checkout-modal.component';
import { LootboxPresaleComponent } from './components/lootbox-presale/lootbox-presale.component';
import { MerchComponent } from './components/merch/merch.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { LootboxPresaleThreeService } from './services/lootbox-presale-threejs.service';
import { StoreService } from './services/store.service';

const routes: Routes = [
  {
    path: '',
    component: BlackMarketComponent,
    canActivate: [AuthGuard],
    title: 'Black market',
  }
]

@NgModule({
  declarations: [
    BlackMarketComponent,
    LootboxPresaleComponent,
    MerchComponent,
    ProductDetailComponent,
    ShoppingCartComponent,
    CheckoutModalComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SwiperModule,
    NgxSliderModule,
    ChainSwitcherComponent,
    LootboxStatsDisplayerComponent,
    UrukCheckoutButtonComponent,
    AccordionModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    BlackMarketComponent
  ],
  providers: [
    LootboxPresaleThreeService,
    PresaleContractService,
    StoreService
  ],
})
export class BlackMarketModule { }
