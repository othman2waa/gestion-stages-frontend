import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttestationsAdminComponent } from './attestations-admin.component';

describe('AttestationsAdminComponent', () => {
  let component: AttestationsAdminComponent;
  let fixture: ComponentFixture<AttestationsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttestationsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttestationsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
