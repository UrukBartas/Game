import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FortuneWheelComponent } from './fortune-wheel.component';

describe('FortuneWheelComponent', () => {
  let component: FortuneWheelComponent;
  let fixture: ComponentFixture<FortuneWheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FortuneWheelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FortuneWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
