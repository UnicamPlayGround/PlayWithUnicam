import { TestBed } from '@angular/core/testing';

import { ErrorManagerService } from './error-manager.service';

describe('ErrorManagerService', () => {
  let service: ErrorManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
