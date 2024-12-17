import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoFailedComponent } from './crypto-failed.component';

describe('CryptoFailedComponent', () => {
  let component: CryptoFailedComponent;
  let fixture: ComponentFixture<CryptoFailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptoFailedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptoFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
