import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminForecastPageComponent } from './admin-forecast-page.component';

describe('AdminForecastPageComponent', () => {
  let component: AdminForecastPageComponent;
  let fixture: ComponentFixture<AdminForecastPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminForecastPageComponent]
    });
    fixture = TestBed.createComponent(AdminForecastPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
