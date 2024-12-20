import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptPlayerStateComponent } from './crypt-player-state.component';

describe('CryptPlayerStateComponent', () => {
  let component: CryptPlayerStateComponent;
  let fixture: ComponentFixture<CryptPlayerStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CryptPlayerStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptPlayerStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
