import { TestBed } from '@angular/core/testing';

import { AuthUtentiGuard } from './auth-utenti.guard';

describe('AuthUtentiGuard', () => {
  let guard: AuthUtentiGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthUtentiGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
