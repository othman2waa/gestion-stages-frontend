import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagiaireEvaluationsComponent } from './stagiaire-evaluations.component';

describe('StagiaireEvaluationsComponent', () => {
  let component: StagiaireEvaluationsComponent;
  let fixture: ComponentFixture<StagiaireEvaluationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagiaireEvaluationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagiaireEvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
