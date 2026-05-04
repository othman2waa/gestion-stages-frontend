import { TestBed } from '@angular/core/testing';

import { DocumentCandidatureService } from './document-candidature.service';

describe('DocumentCandidatureService', () => {
  let service: DocumentCandidatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentCandidatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
