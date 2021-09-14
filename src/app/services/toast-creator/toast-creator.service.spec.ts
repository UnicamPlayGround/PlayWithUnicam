import { TestBed } from '@angular/core/testing';

import { ToastCreatorService } from './toast-creator.service';

describe('ToastCreatorService', () => {
  let service: ToastCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
