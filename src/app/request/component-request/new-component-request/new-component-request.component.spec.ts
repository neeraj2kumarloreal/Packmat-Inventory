import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewComponentRequestComponent } from './new-component-request.component';

describe('NewComponentRequestComponent', () => {
  let component: NewComponentRequestComponent;
  let fixture: ComponentFixture<NewComponentRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewComponentRequestComponent]
    });
    fixture = TestBed.createComponent(NewComponentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
