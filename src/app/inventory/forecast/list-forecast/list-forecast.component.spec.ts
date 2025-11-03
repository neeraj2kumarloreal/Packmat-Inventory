import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListForecastComponent } from './list-forecast.component';

describe('ListForecastComponent', () => {
  let component: ListForecastComponent;
  let fixture: ComponentFixture<ListForecastComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListForecastComponent]
    });
    fixture = TestBed.createComponent(ListForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
