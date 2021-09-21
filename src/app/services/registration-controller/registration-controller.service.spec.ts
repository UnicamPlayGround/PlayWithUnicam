import { TestBed } from '@angular/core/testing';

import { RegistrationControllerService } from './registration-controller.service';

describe('RegistrationControllerService', () => {
  let service: RegistrationControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrationControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
