import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditItemComponent } from './view-edit-item.component';

describe('ViewEditItemComponent', () => {
  let component: ViewEditItemComponent;
  let fixture: ComponentFixture<ViewEditItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewEditItemComponent]
    });
    fixture = TestBed.createComponent(ViewEditItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
