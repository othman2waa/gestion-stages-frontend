import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidaturePubliqueComponent } from './candidature-publique.component';

describe('CandidaturePubliqueComponent', () => {
  let component: CandidaturePubliqueComponent;
  let fixture: ComponentFixture<CandidaturePubliqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidaturePubliqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidaturePubliqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
