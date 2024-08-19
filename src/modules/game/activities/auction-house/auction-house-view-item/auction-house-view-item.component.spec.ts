import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionHouseViewItemComponent } from './auction-house-view-item.component';

describe('AuctionHouseViewItemComponent', () => {
  let component: AuctionHouseViewItemComponent;
  let fixture: ComponentFixture<AuctionHouseViewItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuctionHouseViewItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuctionHouseViewItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
