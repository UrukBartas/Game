import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlacksmithContextMenuComponent } from './blacksmith-context-menu.component';

describe('BlacksmithContextMenuComponent', () => {
  let component: BlacksmithContextMenuComponent;
  let fixture: ComponentFixture<BlacksmithContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlacksmithContextMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BlacksmithContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
