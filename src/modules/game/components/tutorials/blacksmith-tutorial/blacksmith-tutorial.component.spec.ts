import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlacksmithTutorialComponent } from './blacksmith-tutorial.component';

describe('BlacksmithTutorialComponent', () => {
  let component: BlacksmithTutorialComponent;
  let fixture: ComponentFixture<BlacksmithTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlacksmithTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BlacksmithTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
