import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdventurePickerComponent } from './adventure-picker.component';

describe('AdventurePickerComponent', () => {
  let component: AdventurePickerComponent;
  let fixture: ComponentFixture<AdventurePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdventurePickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdventurePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
