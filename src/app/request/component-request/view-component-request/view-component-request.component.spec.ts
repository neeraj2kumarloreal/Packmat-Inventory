import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewComponentRequestComponent } from './view-component-request.component';

describe('ViewComponentRequestComponent', () => {
  let component: ViewComponentRequestComponent;
  let fixture: ComponentFixture<ViewComponentRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewComponentRequestComponent]
    });
    fixture = TestBed.createComponent(ViewComponentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
