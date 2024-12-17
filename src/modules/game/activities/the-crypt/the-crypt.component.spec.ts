import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheCryptComponent } from './the-crypt.component';

describe('TheCryptComponent', () => {
  let component: TheCryptComponent;
  let fixture: ComponentFixture<TheCryptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TheCryptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TheCryptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
