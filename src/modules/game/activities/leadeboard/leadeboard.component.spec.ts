import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadeboardComponent } from './leadeboard.component';

describe('LeadeboardComponent', () => {
  let component: LeadeboardComponent;
  let fixture: ComponentFixture<LeadeboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeadeboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadeboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
