import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptFinishedComponent } from './crypt-finished.component';

describe('CryptFinishedComponent', () => {
  let component: CryptFinishedComponent;
  let fixture: ComponentFixture<CryptFinishedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptFinishedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptFinishedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
