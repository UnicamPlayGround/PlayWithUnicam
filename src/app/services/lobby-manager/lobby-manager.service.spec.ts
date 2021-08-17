import { TestBed } from '@angular/core/testing';

import { LobbyManagerService } from './lobby-manager.service';

describe('LobbyManagerService', () => {
  let service: LobbyManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LobbyManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
