import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSelectorComponent } from './balance-selector.component';

describe('BalanceSelectorComponent', () => {
  let component: BalanceSelectorComponent;
  let fixture: ComponentFixture<BalanceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
