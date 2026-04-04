import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SujetsEncadrantComponent } from './sujets-encadrant.component';

describe('SujetsEncadrantComponent', () => {
  let component: SujetsEncadrantComponent;
  let fixture: ComponentFixture<SujetsEncadrantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetsEncadrantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SujetsEncadrantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
