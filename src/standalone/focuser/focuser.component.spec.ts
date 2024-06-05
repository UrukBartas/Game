import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocuserComponent } from './focuser.component';

describe('FocuserComponent', () => {
  let component: FocuserComponent;
  let fixture: ComponentFixture<FocuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FocuserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FocuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
