import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabernTutorialComponent } from './tabern-tutorial.component';

describe('TabernTutorialComponent', () => {
  let component: TabernTutorialComponent;
  let fixture: ComponentFixture<TabernTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabernTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabernTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
