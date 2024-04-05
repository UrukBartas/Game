import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterReferralComponent } from './register-referral.component';

describe('RegisterReferralComponent', () => {
  let component: RegisterReferralComponent;
  let fixture: ComponentFixture<RegisterReferralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterReferralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
