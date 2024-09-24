import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeRemoveRequestModalComponent } from './stake-remove-request-modal.component';

describe('StakeRemoveRequestModalComponent', () => {
  let component: StakeRemoveRequestModalComponent;
  let fixture: ComponentFixture<StakeRemoveRequestModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StakeRemoveRequestModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StakeRemoveRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
