import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGatepassRequestComponent } from './edit-gatepass-request.component';

describe('EditGatepassRequestComponent', () => {
  let component: EditGatepassRequestComponent;
  let fixture: ComponentFixture<EditGatepassRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditGatepassRequestComponent]
    });
    fixture = TestBed.createComponent(EditGatepassRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
