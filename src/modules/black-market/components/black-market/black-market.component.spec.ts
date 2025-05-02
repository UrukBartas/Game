import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackMarketComponent } from './black-market.component';

describe('BlackMarketComponent', () => {
  let component: BlackMarketComponent;
  let fixture: ComponentFixture<BlackMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlackMarketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BlackMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
