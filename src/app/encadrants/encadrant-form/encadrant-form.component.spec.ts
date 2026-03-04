import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncadrantFormComponent } from './encadrant-form.component';

describe('EncadrantFormComponent', () => {
  let component: EncadrantFormComponent;
  let fixture: ComponentFixture<EncadrantFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncadrantFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncadrantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
