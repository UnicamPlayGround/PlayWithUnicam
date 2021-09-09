import { TestBed } from '@angular/core/testing';

import { AuthGiocatoriGuard } from './auth-giocatori.guard';

describe('AuthGiocatoriGuard', () => {
  let guard: AuthGiocatoriGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGiocatoriGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
