import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QioHomeComponent } from './qio-home.component';

describe('QioHomeComponent', () => {
  let component: QioHomeComponent;
  let fixture: ComponentFixture<QioHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QioHomeComponent]
    });
    fixture = TestBed.createComponent(QioHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
