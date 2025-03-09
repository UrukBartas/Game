import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonsterTypeAvatarComponent } from './monster-type-avatar.component';

describe('MonsterTypeAvatarComponent', () => {
  let component: MonsterTypeAvatarComponent;
  let fixture: ComponentFixture<MonsterTypeAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonsterTypeAvatarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonsterTypeAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
