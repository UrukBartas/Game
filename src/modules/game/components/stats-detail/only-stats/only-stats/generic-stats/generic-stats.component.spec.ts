import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericStatsComponent } from './generic-stats.component';

describe('GenericStatsComponent', () => {
  let component: GenericStatsComponent;
  let fixture: ComponentFixture<GenericStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenericStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenericStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
