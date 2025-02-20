import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BridgeTutorialComponent } from './bridge-tutorial.component';

describe('BridgeTutorialComponent', () => {
  let component: BridgeTutorialComponent;
  let fixture: ComponentFixture<BridgeTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BridgeTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BridgeTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
