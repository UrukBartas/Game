import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsDetailComponent } from './stats-detail.component';

describe('StatsDetailComponent', () => {
  let component: StatsDetailComponent;
  let fixture: ComponentFixture<StatsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
