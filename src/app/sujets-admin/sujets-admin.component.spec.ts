import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SujetsAdminComponent } from './sujets-admin.component';

describe('SujetsAdminComponent', () => {
  let component: SujetsAdminComponent;
  let fixture: ComponentFixture<SujetsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SujetsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
