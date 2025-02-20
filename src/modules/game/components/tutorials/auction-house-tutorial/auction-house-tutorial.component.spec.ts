import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionHouseTutorialComponent } from './auction-house-tutorial.component';

describe('AuctionHouseTutorialComponent', () => {
  let component: AuctionHouseTutorialComponent;
  let fixture: ComponentFixture<AuctionHouseTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuctionHouseTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuctionHouseTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
