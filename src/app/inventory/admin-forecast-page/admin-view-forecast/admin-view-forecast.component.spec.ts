import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewForecastComponent } from './admin-view-forecast.component';

describe('AdminViewForecastComponent', () => {
  let component: AdminViewForecastComponent;
  let fixture: ComponentFixture<AdminViewForecastComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminViewForecastComponent]
    });
    fixture = TestBed.createComponent(AdminViewForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
