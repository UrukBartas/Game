import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinMaxComboSelectorComponent } from './min-max-combo-selector.component';

describe('MinMaxComboSelectorComponent', () => {
  let component: MinMaxComboSelectorComponent;
  let fixture: ComponentFixture<MinMaxComboSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinMaxComboSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MinMaxComboSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
