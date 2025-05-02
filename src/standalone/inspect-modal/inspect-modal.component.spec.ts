import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectModalComponent } from './inspect-modal.component';

describe('InspectModalComponent', () => {
  let component: InspectModalComponent;
  let fixture: ComponentFixture<InspectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InspectModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InspectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
