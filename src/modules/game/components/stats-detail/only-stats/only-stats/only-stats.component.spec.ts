import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlyStatsComponent } from './only-stats.component';

describe('OnlyStatsComponent', () => {
  let component: OnlyStatsComponent;
  let fixture: ComponentFixture<OnlyStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlyStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnlyStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
