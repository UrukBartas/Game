import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptProgressComponent } from './crypt-progress.component';

describe('CryptProgressComponent', () => {
  let component: CryptProgressComponent;
  let fixture: ComponentFixture<CryptProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptProgressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
