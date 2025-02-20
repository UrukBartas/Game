import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestTutorialComponent } from './quest-tutorial.component';

describe('QuestTutorialComponent', () => {
  let component: QuestTutorialComponent;
  let fixture: ComponentFixture<QuestTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuestTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
