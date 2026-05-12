import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatureTimelineComponent } from './candidature-timeline.component';

describe('CandidatureTimelineComponent', () => {
  let component: CandidatureTimelineComponent;
  let fixture: ComponentFixture<CandidatureTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatureTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatureTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
