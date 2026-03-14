import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviHebdomadaireComponent } from './suivi-hebdomadaire.component';

describe('SuiviHebdomadaireComponent', () => {
  let component: SuiviHebdomadaireComponent;
  let fixture: ComponentFixture<SuiviHebdomadaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviHebdomadaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviHebdomadaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
