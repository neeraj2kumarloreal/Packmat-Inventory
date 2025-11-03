import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentRequestComponent } from './component-request.component';

describe('ComponentRequestComponent', () => {
  let component: ComponentRequestComponent;
  let fixture: ComponentFixture<ComponentRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComponentRequestComponent]
    });
    fixture = TestBed.createComponent(ComponentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
