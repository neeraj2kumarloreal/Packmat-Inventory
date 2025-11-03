import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListComponentRequestComponent } from './list-component-request.component';

describe('ListComponentRequestComponent', () => {
  let component: ListComponentRequestComponent;
  let fixture: ComponentFixture<ListComponentRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListComponentRequestComponent]
    });
    fixture = TestBed.createComponent(ListComponentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
