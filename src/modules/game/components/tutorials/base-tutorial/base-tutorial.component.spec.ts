import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTutorialComponent } from './base-tutorial.component';

describe('BaseTutorialComponent', () => {
  let component: BaseTutorialComponent;
  let fixture: ComponentFixture<BaseTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BaseTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
