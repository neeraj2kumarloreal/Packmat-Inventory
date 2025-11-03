import { TestBed } from '@angular/core/testing';

import { ComponentRequestHistoryService } from './component-request-history.service';

describe('ComponentRequestHistoryService', () => {
  let service: ComponentRequestHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentRequestHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
