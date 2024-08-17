import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentStatsComponent } from './percent-stats.component';

describe('PercentStatsComponent', () => {
  let component: PercentStatsComponent;
  let fixture: ComponentFixture<PercentStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PercentStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PercentStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
