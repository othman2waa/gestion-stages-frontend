import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnoncesPubliquesComponent } from './annonces-publiques.component';

describe('AnnoncesPubliquesComponent', () => {
  let component: AnnoncesPubliquesComponent;
  let fixture: ComponentFixture<AnnoncesPubliquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnoncesPubliquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnoncesPubliquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
