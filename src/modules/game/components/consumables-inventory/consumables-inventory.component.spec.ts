import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumablesInventoryComponent } from './consumables-inventory.component';

describe('ConsumablesInventoryComponent', () => {
  let component: ConsumablesInventoryComponent;
  let fixture: ComponentFixture<ConsumablesInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsumablesInventoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsumablesInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
