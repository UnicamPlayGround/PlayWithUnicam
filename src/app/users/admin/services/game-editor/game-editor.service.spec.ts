import { TestBed } from '@angular/core/testing';

import { GameEditorService } from './game-editor.service';

describe('GameEditorService', () => {
  let service: GameEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
