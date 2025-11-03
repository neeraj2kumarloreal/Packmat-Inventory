import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessGatepassRequestComponent } from './process-gatepass-request.component';

describe('ProcessGatepassRequestComponent', () => {
  let component: ProcessGatepassRequestComponent;
  let fixture: ComponentFixture<ProcessGatepassRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessGatepassRequestComponent]
    });
    fixture = TestBed.createComponent(ProcessGatepassRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
