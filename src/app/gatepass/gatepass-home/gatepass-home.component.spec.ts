import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatepassHomeComponent } from './gatepass-home.component';

describe('GatepassHomeComponent', () => {
  let component: GatepassHomeComponent;
  let fixture: ComponentFixture<GatepassHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GatepassHomeComponent]
    });
    fixture = TestBed.createComponent(GatepassHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
