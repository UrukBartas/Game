import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptRewardPickerComponent } from './crypt-reward-picker.component';

describe('CryptRewardPickerComponent', () => {
  let component: CryptRewardPickerComponent;
  let fixture: ComponentFixture<CryptRewardPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptRewardPickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptRewardPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
