import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseQioComponent } from './raise-qio.component';

describe('RaiseQioComponent', () => {
  let component: RaiseQioComponent;
  let fixture: ComponentFixture<RaiseQioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RaiseQioComponent]
    });
    fixture = TestBed.createComponent(RaiseQioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
