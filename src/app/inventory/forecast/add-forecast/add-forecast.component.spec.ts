import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddForecastComponent } from './add-forecast.component';

describe('AddForecastComponent', () => {
  let component: AddForecastComponent;
  let fixture: ComponentFixture<AddForecastComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddForecastComponent]
    });
    fixture = TestBed.createComponent(AddForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
