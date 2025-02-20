import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptTutorialComponent } from './crypt-tutorial.component';

describe('CryptTutorialComponent', () => {
  let component: CryptTutorialComponent;
  let fixture: ComponentFixture<CryptTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
