import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortailCandidatureComponent } from './portail-candidature.component';

describe('PortailCandidatureComponent', () => {
  let component: PortailCandidatureComponent;
  let fixture: ComponentFixture<PortailCandidatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortailCandidatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortailCandidatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
