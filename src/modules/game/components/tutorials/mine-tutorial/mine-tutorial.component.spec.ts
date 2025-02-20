import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MineTutorialComponent } from './mine-tutorial.component';

describe('MineTutorialComponent', () => {
  let component: MineTutorialComponent;
  let fixture: ComponentFixture<MineTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MineTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MineTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
