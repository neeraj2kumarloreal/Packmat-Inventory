import { TestBed } from '@angular/core/testing';

import { ComponentRequestService } from './component-request.service';

describe('ComponentRequestService', () => {
  let service: ComponentRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
