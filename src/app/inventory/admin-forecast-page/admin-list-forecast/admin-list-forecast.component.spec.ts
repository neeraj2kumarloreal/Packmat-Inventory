import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListForecastComponent } from './admin-list-forecast.component';

describe('AdminListForecastComponent', () => {
  let component: AdminListForecastComponent;
  let fixture: ComponentFixture<AdminListForecastComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminListForecastComponent]
    });
    fixture = TestBed.createComponent(AdminListForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
