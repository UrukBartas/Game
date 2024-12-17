import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptStartComponent } from './crypt-start.component';

describe('CryptStartComponent', () => {
  let component: CryptStartComponent;
  let fixture: ComponentFixture<CryptStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptStartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
