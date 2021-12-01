import { TestBed } from '@angular/core/testing';

import { TimerController } from './timer-controller.service';

describe('TimerController', () => {
  let service: TimerController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
