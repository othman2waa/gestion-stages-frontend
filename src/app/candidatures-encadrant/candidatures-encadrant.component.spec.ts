import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidaturesEncadrantComponent } from './candidatures-encadrant.component';

describe('CandidaturesEncadrantComponent', () => {
  let component: CandidaturesEncadrantComponent;
  let fixture: ComponentFixture<CandidaturesEncadrantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidaturesEncadrantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidaturesEncadrantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
