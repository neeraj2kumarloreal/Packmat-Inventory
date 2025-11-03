import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsForReviewComponent } from './requests-for-review.component';

describe('RequestsForReviewComponent', () => {
  let component: RequestsForReviewComponent;
  let fixture: ComponentFixture<RequestsForReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestsForReviewComponent]
    });
    fixture = TestBed.createComponent(RequestsForReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
