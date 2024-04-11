import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandInventoryTooltipComponent } from './expand-inventory-tooltip.component';

describe('ExpandInventoryTooltipComponent', () => {
  let component: ExpandInventoryTooltipComponent;
  let fixture: ComponentFixture<ExpandInventoryTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandInventoryTooltipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpandInventoryTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
