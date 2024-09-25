import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainSwitcherComponent } from './chain-switcher.component';

describe('ChainSwitcherComponent', () => {
  let component: ChainSwitcherComponent;
  let fixture: ComponentFixture<ChainSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChainSwitcherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChainSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
