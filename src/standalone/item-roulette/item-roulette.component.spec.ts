import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemRouletteComponent } from './item-roulette.component';

describe('ItemRouletteComponent', () => {
  let component: ItemRouletteComponent;
  let fixture: ComponentFixture<ItemRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemRouletteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItemRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
