import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveMissionDisplayerComponent } from './active-mission-displayer.component';

describe('ActiveMissionDisplayerComponent', () => {
  let component: ActiveMissionDisplayerComponent;
  let fixture: ComponentFixture<ActiveMissionDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveMissionDisplayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActiveMissionDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
