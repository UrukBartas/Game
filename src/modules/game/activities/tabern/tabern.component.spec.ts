import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabernComponent } from './tabern.component';

describe('TabernComponent', () => {
  let component: TabernComponent;
  let fixture: ComponentFixture<TabernComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabernComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
