import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptFightComponent } from './crypt-fight.component';

describe('CryptFightComponent', () => {
  let component: CryptFightComponent;
  let fixture: ComponentFixture<CryptFightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptFightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptFightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
