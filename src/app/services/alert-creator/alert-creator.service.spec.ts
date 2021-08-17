import { TestBed } from '@angular/core/testing';

import { AlertCreatorService } from './alert-creator.service';

describe('AlertCreatorService', () => {
  let service: AlertCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
