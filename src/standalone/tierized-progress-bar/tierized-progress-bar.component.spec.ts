import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierizedProgressBarComponent } from './tierized-progress-bar.component';

describe('TierizedProgressBarComponent', () => {
  let component: TierizedProgressBarComponent;
  let fixture: ComponentFixture<TierizedProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierizedProgressBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TierizedProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
