import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListGatepassComponent } from './list-gatepass.component';

describe('ListGatepassComponent', () => {
  let component: ListGatepassComponent;
  let fixture: ComponentFixture<ListGatepassComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListGatepassComponent]
    });
    fixture = TestBed.createComponent(ListGatepassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
