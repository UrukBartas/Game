import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteItemBoxComponent } from './remote-item-box.component';

describe('RemoteItemBoxComponent', () => {
  let component: RemoteItemBoxComponent;
  let fixture: ComponentFixture<RemoteItemBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteItemBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RemoteItemBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
