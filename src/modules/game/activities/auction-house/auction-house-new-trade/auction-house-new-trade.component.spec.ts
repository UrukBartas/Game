import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionHouseNewTradeComponent } from './auction-house-new-trade.component';

describe('AuctionHouseNewTradeComponent', () => {
  let component: AuctionHouseNewTradeComponent;
  let fixture: ComponentFixture<AuctionHouseNewTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuctionHouseNewTradeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuctionHouseNewTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
