import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuInventoryOptionsComponent } from './context-menu-inventory-options.component';

describe('ContextMenuInventoryOptionsComponent', () => {
  let component: ContextMenuInventoryOptionsComponent;
  let fixture: ComponentFixture<ContextMenuInventoryOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuInventoryOptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContextMenuInventoryOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
