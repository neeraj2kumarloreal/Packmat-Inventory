import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGatepassComponent } from './create-gatepass.component';

describe('CreateGatepassComponent', () => {
  let component: CreateGatepassComponent;
  let fixture: ComponentFixture<CreateGatepassComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateGatepassComponent]
    });
    fixture = TestBed.createComponent(CreateGatepassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
