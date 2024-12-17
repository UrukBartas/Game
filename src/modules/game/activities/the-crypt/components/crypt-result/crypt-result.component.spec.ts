import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptResultComponent } from './crypt-result.component';

describe('CryptResultComponent', () => {
  let component: CryptResultComponent;
  let fixture: ComponentFixture<CryptResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptResultComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
