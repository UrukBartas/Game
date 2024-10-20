import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleGeneratorModalComponent } from './title-generator-modal.component';

describe('TitleGeneratorModalComponent', () => {
  let component: TitleGeneratorModalComponent;
  let fixture: ComponentFixture<TitleGeneratorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TitleGeneratorModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TitleGeneratorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
