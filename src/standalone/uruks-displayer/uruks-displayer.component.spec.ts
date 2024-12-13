import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UruksDisplayerComponent } from './uruks-displayer.component';

describe('UruksDisplayerComponent', () => {
  let component: UruksDisplayerComponent;
  let fixture: ComponentFixture<UruksDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UruksDisplayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UruksDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
