import { TestBed } from '@angular/core/testing';

import { QioService } from './qio.service';

describe('QioService', () => {
  let service: QioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
